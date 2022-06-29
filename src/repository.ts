require("dotenv").config();
const connectionString: string = process.env.CONNECTION_STRING!;
const sql = require("mssql");

import { Fact } from "./fact";
import { Rule } from "./rule";

const getFact = async (tableName: string): Promise<Fact | undefined> => {
  let result: Fact | undefined;
  await sql.connect(connectionString);

  const [
    numberOfRowsPromise,
    numberOfIndexesPromise,
    primaryKeyColumnCountPromise,
  ] = await Promise.all([
    sql.query(`${numberOfRowsQuery(tableName)}`),
    sql.query(`${numberOfIndexesQuery(tableName)}`),
    sql.query(`${primaryKeyColumnCountQuery(tableName)}`),
  ]);

  const numberOfRows: number = getDataFromResult(numberOfRowsPromise);
  const numberOfIndexes: number = getDataFromResult(numberOfIndexesPromise);
  const primaryKeyColumnCount: number = getDataFromResult(
    primaryKeyColumnCountPromise
  );
  const hasPrimaryKey: boolean = primaryKeyColumnCount >= 1;

  result = {
    tableName,
    numberOfRows,
    numberOfIndexes,
    hasPrimaryKey,
    // Show only if PK exists
    primaryKeyColumnCount: hasPrimaryKey ? primaryKeyColumnCount : undefined,
  };

  return result;
};

const getRule = async (tableName: string): Promise<Rule | undefined> => {
  const fact: Fact | undefined = await getFact(tableName);
  if (!fact) {
    throw new Error("Something went wrong.");
  }

  const numberOfRowsCheck: boolean = fact.numberOfRows <= 10000000;
  const hasPrimaryKeyCheck: boolean = fact.hasPrimaryKey;
  const primaryKeyColumnCountCheck: boolean =
    typeof fact.primaryKeyColumnCount === "number" &&
    fact.primaryKeyColumnCount < 4;

  const PASSED: string = "PASSED";
  const FAILED: string = "FAILED";
  const numberOfRowsError: string = `Warning! Large table. The number of rows is ${fact.numberOfRows}`;
  const hasPrimaryKeyError: string = "Warning: the table doesn’t have a PK.";
  const primaryKeyColumnCountError: string = `High number of columns in the PK: ${fact.primaryKeyColumnCount}`;

  let result: Rule | undefined = {
    tableName,
    highNumberOfRows: {
      status: numberOfRowsCheck ? PASSED : FAILED,
      message: !numberOfRowsCheck ? numberOfRowsError : undefined,
    },
    tableWithoutPrivateKey: {
      status: hasPrimaryKeyCheck ? PASSED : FAILED,
      message: !hasPrimaryKeyCheck ? hasPrimaryKeyError : undefined,
    },
    // Show only if PK exists
    primaryKeyWithManyColumns: hasPrimaryKeyCheck
      ? {
          status: primaryKeyColumnCountCheck ? PASSED : FAILED,
          message: !primaryKeyColumnCountCheck
            ? primaryKeyColumnCountError
            : undefined,
        }
      : undefined,
  };

  return result;
};

// Utils
const getDataFromResult = (result: any): any => {
  return result.recordset[0][""];
};

// Queries
const numberOfRowsQuery = (tableName: string) =>
  `SELECT COUNT(*) FROM ${tableName};`;
const numberOfIndexesQuery = (tableName: string) =>
  "SELECT COUNT(*) FROM sys.indexes AS IND " +
  `WHERE object_id = object_ID('${tableName}') AND index_id != 0`;
const primaryKeyColumnCountQuery = (tableName: string) =>
  "SELECT COUNT(INC.column_id) " +
  "FROM sys.indexes as IND " +
  "INNER JOIN sys.index_columns as INC " +
  "ON IND.object_id = INC.object_id " +
  "AND IND.index_id = INC.index_id " +
  `WHERE IND.object_id = object_ID('${tableName}') ` +
  "AND IND.is_primary_key = 1;";

export { getFact, getRule };
