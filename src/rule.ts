type Rule = {
  tableName: string;
  highNumberOfRows: Criteria;
  tableWithoutPrivateKey: Criteria;
  primaryKeyWithManyColumns: Criteria | undefined;
};

type Criteria = {
  status: string;
  message: string | undefined;
};

export { Rule };
