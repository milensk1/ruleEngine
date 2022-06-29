type Rule = {
  tableName: string;
  highNumberOfRows: Criteria;
  tableWithoutPrimaryKey: Criteria;
  primaryKeyWithManyColumns: Criteria | undefined;
};

type Criteria = {
  status: string;
  message: string | undefined;
};

export { Rule };
