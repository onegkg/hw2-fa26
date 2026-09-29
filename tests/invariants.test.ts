/**
 * invariants.test.ts — end-to-end schedule invariant tests.
 *
 * These tests run the real solver pipeline against an in-memory database and
 * verify that the resulting plan satisfies correctness properties. Because the
 * pipeline is imported directly from src/solver/pipeline.ts, fixing a bug
 * there is sufficient to make the corresponding test pass.
 *
 * Task 5: add a test for your constraint at the end of this file.
 */

import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { beforeAll, describe, expect, it } from "vitest";
import { all, openDb, run } from "../src/db/connection.js";
import type { Db } from "../src/db/connection.js";
import { getCourses } from "../src/db/queries.js";
import type { Prerequisite, PlanRow } from "../src/db/queries.js";
import { runSolver } from "../src/solver/pipeline.js";

const __dirname = dirname(fileURLToPath(import.meta.url));

function buildTestDb(): Db {
  const db = openDb(":memory:");
  run(db, readFileSync(resolve(__dirname, "../src/db/schema.sql"), "utf-8"));
  run(db, readFileSync(resolve(__dirname, "../src/db/seed.sql"), "utf-8"));
  return db;
}

// Read the prerequisites straight from the table. The checks below compare
// the plan against this, not against whatever the pipeline read.
function getAllPrereqs(db: Db): Prerequisite[] {
  return all<Prerequisite>(db, "SELECT course_id, prereq_id FROM prerequisites");
}

let plan: PlanRow[];
let db: Db;

beforeAll(async () => {
  db = buildTestDb();
  plan = await runSolver(db);
}, 60_000);

describe("schedule invariants", () => {
  it("every course appears in the plan exactly once", () => {
    const courses = getCourses(db);
    expect(plan).toHaveLength(courses.length);
    const ids = plan.map((r) => r.course_id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("all semesters are in the valid range [1, 4]", () => {
    for (const row of plan) {
      expect(row.semester, `${row.course_id} has semester ${row.semester}`).toBeGreaterThanOrEqual(1);
      expect(row.semester, `${row.course_id} has semester ${row.semester}`).toBeLessThanOrEqual(4);
    }
  });

  it("every prerequisite is respected (prereq in strictly earlier semester)", () => {
    const allPrereqs = getAllPrereqs(db);
    const semOf = new Map(plan.map((r) => [r.course_id, r.semester]));

    for (const { course_id, prereq_id } of allPrereqs) {
      const courseSem = semOf.get(course_id);
      const prereqSem = semOf.get(prereq_id);
      if (courseSem === undefined || prereqSem === undefined) continue;
      expect(
        courseSem,
        `${course_id} (sem ${courseSem}) should come after ${prereq_id} (sem ${prereqSem})`,
      ).toBeGreaterThan(prereqSem);
    }
  });

  it("no course shares a semester with its prerequisite", () => {
    const allPrereqs = getAllPrereqs(db);
    const semOf = new Map(plan.map((r) => [r.course_id, r.semester]));

    for (const { course_id, prereq_id } of allPrereqs) {
      const courseSem = semOf.get(course_id);
      const prereqSem = semOf.get(prereq_id);
      if (courseSem === undefined || prereqSem === undefined) continue;
      expect(
        courseSem,
        `${course_id} and ${prereq_id} must not be in the same semester`,
      ).not.toBe(prereqSem);
    }
  });

  it("no semester exceeds 18 total credits", () => {
    const courses = getCourses(db);
    const creditMap = new Map(courses.map((c) => [c.id, c.credits]));
    const semTotals = new Map<number, number>();

    for (const row of plan) {
      const credits = creditMap.get(row.course_id) ?? 0;
      semTotals.set(row.semester, (semTotals.get(row.semester) ?? 0) + credits);
    }

    for (const [sem, total] of semTotals) {
      expect(total, `Semester ${sem} has ${total} credits`).toBeLessThanOrEqual(18);
    }
  });
});

// Task 5: a test that the plan follows your constraint. It must fail if you
// take studentConstraint out of activeConstraints (try it!).
describe("Task 5", () => {
  it.todo("the plan follows my constraint");
});
