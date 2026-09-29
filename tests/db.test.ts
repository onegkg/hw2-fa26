/**
 * db.test.ts — tests for the database layer.
 *
 * These tests use an in-memory SQLite database so they run without requiring
 * a real db.sqlite file. They should pass before and after your bug fixes.
 */

import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { beforeAll, describe, expect, it } from "vitest";
import { openDb, run } from "../src/db/connection.js";
import type { Db } from "../src/db/connection.js";
import { getCourses, getPrerequisites, clearAndInsertPlan, getPlan } from "../src/db/queries.js";

const __dirname = dirname(fileURLToPath(import.meta.url));

function buildTestDb(): Db {
  const db = openDb(":memory:");
  const schema = readFileSync(resolve(__dirname, "../src/db/schema.sql"), "utf-8");
  const seed = readFileSync(resolve(__dirname, "../src/db/seed.sql"), "utf-8");
  run(db, schema);
  run(db, seed);
  return db;
}

describe("getCourses", () => {
  let db: Db;
  beforeAll(() => { db = buildTestDb(); });

  it("returns all 13 seeded courses", () => {
    const courses = getCourses(db);
    expect(courses).toHaveLength(13);
  });

  it("every course has required fields", () => {
    const courses = getCourses(db);
    for (const c of courses) {
      expect(c.id).toBeTypeOf("string");
      expect(c.name).toBeTypeOf("string");
      expect(c.credits).toBeTypeOf("number");
      expect(c.department).toBeTypeOf("string");
      expect(c.credits).toBeGreaterThan(0);
    }
  });
});

describe("getPrerequisites", () => {
  let db: Db;
  beforeAll(() => { db = buildTestDb(); });

  it("returns all 9 seeded prerequisite pairs", () => {
    const prereqs = getPrerequisites(db);
    expect(prereqs).toHaveLength(9);
  });

  it("includes the cross-department prerequisite (math39a → cosi29a)", () => {
    const prereqs = getPrerequisites(db);
    const crossDept = prereqs.find(
      (p) => p.course_id === "math39a" && p.prereq_id === "cosi29a",
    );
    expect(crossDept).toBeDefined();
  });
});

describe("clearAndInsertPlan", () => {
  let db: Db;
  beforeAll(() => { db = buildTestDb(); });

  it("inserts rows and retrieves them", () => {
    clearAndInsertPlan(db, [
      { course_id: "math10a", semester: 1 },
      { course_id: "cosi10a", semester: 1 },
    ]);
    const plan = getPlan(db);
    expect(plan).toHaveLength(2);
  });

  it("clears previous plan before inserting", () => {
    clearAndInsertPlan(db, [{ course_id: "math10a", semester: 2 }]);
    const plan = getPlan(db);
    expect(plan).toHaveLength(1);
    expect(plan[0].semester).toBe(2);
  });
});
