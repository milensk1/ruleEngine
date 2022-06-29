type Fact = {
  tableName: string;
  numberOfRows: number;
  numberOfIndexes: number;
  hasPrimaryKey: boolean;
  primaryKeyColumnCount: number | undefined;
};

export { Fact };
