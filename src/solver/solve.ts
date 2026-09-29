/**
 * solve.ts — CLI entry point for the plan-generation pipeline.
 *
 * Delegates all solver logic to pipeline.ts, which the tests run too, so a
 * change there shows up both here and in the tests.
 *
 * Run with:  npm run solve
 */

import { closeDb, openDb } from "../db/connection.js";
import { runSolver } from "./pipeline.js";

const db = openDb();

console.log("Initializing Z3 solver…");

try {
  await runSolver(db);
  closeDb(db);
  console.log("Plan written to database. Run `npm start` to view it.");
} catch (err) {
  closeDb(db);
  console.error((err as Error).message);
  process.exit(1);
}
