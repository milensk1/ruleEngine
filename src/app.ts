import express, { Application, Request, Response } from "express";
import { Fact } from "./fact";
import { Rule } from "./rule";
import { getFact, getRule } from "./repository";

const app: Application = express();
const port: number = 3001;

app.listen(port, function () {
  console.log(`App is listening on port ${port} !`);
});

// Routes
app.get("/facts", async (req: Request, res: Response) => {
  const query: RequestQuery = req.query;
  let fact: Fact | undefined;

  if (!query?.tableName) {
    res.send("Please include tableName query parameter.");
    return;
  }
  try {
    fact = await getFact(query.tableName);
    res.send(fact);
  } catch (error) {
    res.send("Something went wrong.");
  }
});

app.get("/rules", async (req: Request, res: Response) => {
  const query: RequestQuery = req.query;
  let rule: Rule | undefined;

  if (!query?.tableName) {
    res.send("Please include tableName query parameter.");
    return;
  }
  try {
    rule = await getRule(query.tableName);
    res.send(rule);
  } catch (error) {
    res.send("Something went wrong.");
  }
});

type RequestQuery = { tableName?: string };
