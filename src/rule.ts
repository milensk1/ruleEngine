type Rule = {
  tableName: string;
  highNumberOfRows: Criteria;
  tableWithoutPrivateKey: Criteria;
  privateKeyWithManyColumns: Criteria | undefined;
};

type Criteria = {
  status: string;
  message: string | undefined;
};

export { Rule };
