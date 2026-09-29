/**
 * pipeline.ts — core solver pipeline, shared by solve.ts and the test suite.
 *
 * Steps:
 *   1. Read courses and prerequisites from the database.
 *   2. Initialize Z3 and create one integer variable per course.
 *   3. Apply all active constraints from constraints.ts.
 *   4. Ask Z3 to find a satisfying assignment.
 *   5. Parse the model into (course_id, semester) pairs.
 *   6. Write valid rows back to the database and return all rows.
 *
 * Keeping this logic in a shared module (rather than inlined in solve.ts)
 * means the test suite runs the real pipeline — fixing a bug here fixes it
 * everywhere.
 */

import { init } from "z3-solver";
import { all } from "../db/connection.js";
import type { Db } from "../db/connection.js";
import { getCourses, clearAndInsertPlan } from "../db/queries.js";
import type { Prerequisite, PlanRow } from "../db/queries.js";
import { activeConstraints } from "./constraints.js";

export async function runSolver(db: Db): Promise<PlanRow[]> {
  // ---------------------------------------------------------------------------
  // Step 1: Read courses and prerequisites
  // ---------------------------------------------------------------------------

  const courses = getCourses(db);

  const prereqs = all<Prerequisite>(
    db,
    `SELECT p.course_id, p.prereq_id
     FROM prerequisites p
     JOIN courses c  ON c.id  = p.course_id
     JOIN courses r  ON r.id  = p.prereq_id
     WHERE c.department = r.department`,
  );

  // ---------------------------------------------------------------------------
  // Step 2: Initialize Z3
  // ---------------------------------------------------------------------------

  const { Context } = await init();
  const ctx = new Context("main");

  // One integer variable per course: which semester (1–4) is it assigned to?
  const semVars = new Map(courses.map((c) => [c.id, ctx.Int.const(`sem_${c.id}`)]));

  // ---------------------------------------------------------------------------
  // Step 3: Apply constraints
  // ---------------------------------------------------------------------------

  const solver = new ctx.Solver();

  for (const constraintFn of activeConstraints) {
    const assertions = constraintFn(ctx, semVars, { courses, prereqs });
    for (const assertion of assertions) {
      solver.add(assertion);
    }
  }

  // ---------------------------------------------------------------------------
  // Step 4: Solve
  // ---------------------------------------------------------------------------

  console.log(`Solving with ${courses.length} courses and ${prereqs.length} prerequisites…`);
  const status = await solver.check();

  if (status !== "sat") {
    throw new Error(
      `Solver returned '${status}'. No valid plan exists under the current constraints.\n` +
        `Try removing a constraint from activeConstraints in src/solver/constraints.ts.`,
    );
  }

  // ---------------------------------------------------------------------------
  // Step 5: Parse the model
  // ---------------------------------------------------------------------------

  const model = solver.model();

  const planRows: PlanRow[] = courses.map((c) => ({
    course_id: c.id,
    semester: Number(model.eval(semVars.get(c.id)!, true).toString()) - 1,
  }));

  // ---------------------------------------------------------------------------
  // Step 6: Write plan to database
  // ---------------------------------------------------------------------------

  clearAndInsertPlan(db, planRows.filter((r) => r.semester >= 1));

  return planRows;
}
