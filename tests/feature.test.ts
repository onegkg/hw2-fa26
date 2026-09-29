/**
 * feature.test.ts — Task 7: the tests for the option you chose.
 *
 * Set TASK7_OPTION in src/task7.ts. The tests for the other options are
 * skipped. Option D has no tests here; your TA grades it.
 *
 * These tests check what your feature does, not how: SQL, TypeScript, or a
 * script in the page all pass, as long as the result is right.
 */

import express from "express";
import request from "supertest";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { JSDOM } from "jsdom";
import { beforeAll, describe, expect, it } from "vitest";
import { closeDb, DB_FILE, openDb, run } from "../src/db/connection.js";
import type { Db } from "../src/db/connection.js";
import { clearAndInsertPlan, planWarnings, prerequisiteChain } from "../src/db/queries.js";
import type { PlanRow } from "../src/db/queries.js";
import { TASK7_OPTION } from "../src/task7.js";
import { registerRoutes } from "../src/web/routes.js";

const __dirname = dirname(fileURLToPath(import.meta.url));

function buildDb(file: string): Db {
  const db = openDb(file);
  run(db, readFileSync(resolve(__dirname, "../src/db/schema.sql"), "utf-8"));
  run(db, readFileSync(resolve(__dirname, "../src/db/seed.sql"), "utf-8"));
  return db;
}

/** An Express app like server.ts sets up, using test.sqlite with this plan. */
function buildApp(plan: PlanRow[]): express.Express {
  const db = buildDb(DB_FILE);
  clearAndInsertPlan(db, plan);
  closeDb(db);
  const app = express();
  app.set("view engine", "ejs");
  app.set("views", resolve(__dirname, "../src/templates"));
  registerRoutes(app);
  return app;
}

const text = (doc: Document) => (doc.body.textContent ?? "").replace(/\s+/g, " ");

// A plan that breaks two prerequisites: cosi12b shares semester 1 with its
// prerequisite cosi10a, and math39a comes before its prerequisite cosi29a.
const brokenPlan: PlanRow[] = [
  { course_id: "cosi10a", semester: 1 },
  { course_id: "cosi12b", semester: 1 },
  { course_id: "math39a", semester: 1 },
  { course_id: "cosi29a", semester: 2 },
];
const goodPlan: PlanRow[] = [
  { course_id: "cosi10a", semester: 1 },
  { course_id: "cosi29a", semester: 1 },
  { course_id: "cosi12b", semester: 2 },
  { course_id: "math39a", semester: 2 },
];

describe("Task 7", () => {
  it("TASK7_OPTION in src/task7.ts names the option you chose", () => {
    expect(["A", "B", "C", "D"]).toContain(TASK7_OPTION);
  });
});

describe.runIf(TASK7_OPTION === "A")("Task 7 Option A: prerequisite chains", () => {
  let db: Db;
  beforeAll(() => { db = buildDb(":memory:"); });

  it("a course with no prerequisites has an empty chain", () => {
    expect(prerequisiteChain(db, "cosi10a")).toEqual([]);
  });

  it("includes prerequisites of prerequisites, sorted", () => {
    expect(prerequisiteChain(db, "cosi21a")).toEqual(["cosi10a", "cosi12b"]);
    expect(prerequisiteChain(db, "cosi127b")).toEqual(["cosi10a", "cosi12b", "cosi21a", "cosi29a"]);
  });

  it("follows prerequisites across departments", () => {
    expect(prerequisiteChain(db, "math39a")).toEqual(["cosi29a"]);
  });

  it("/graph shows each course's chain and is linked from the navigation bar", async () => {
    const app = buildApp(goodPlan);
    const res = await request(app).get("/graph");
    expect(res.status).toBe(200);
    const doc = new JSDOM(res.text).window.document;
    expect(doc.querySelector('nav a[href="/graph"]'), "no <a href=\"/graph\"> in the <nav>").not.toBeNull();
    for (const id of ["cosi127b", "cosi29a", "math39a"]) expect(text(doc)).toContain(id);
  });
});

describe.runIf(TASK7_OPTION === "B")("Task 7 Option B: plan warnings", () => {
  let db: Db;
  beforeAll(() => { db = buildDb(":memory:"); });

  it("a plan that follows every prerequisite has no warnings", () => {
    clearAndInsertPlan(db, goodPlan);
    expect(planWarnings(db)).toEqual([]);
  });

  it("warns once for each broken prerequisite, naming both courses", () => {
    clearAndInsertPlan(db, brokenPlan);
    const warnings = planWarnings(db);
    expect(warnings).toHaveLength(2);
    expect(warnings.some((w) => w.includes("cosi12b") && w.includes("cosi10a"))).toBe(true);
    expect(warnings.some((w) => w.includes("math39a") && w.includes("cosi29a"))).toBe(true);
  });

  it("/plan shows the warnings", async () => {
    const app = buildApp(brokenPlan);
    const doc = new JSDOM((await request(app).get("/plan")).text).window.document;
    const shown = [...doc.querySelectorAll(".warning")].map((el) => el.textContent ?? "");
    expect(shown.some((w) => w.includes("cosi12b") && w.includes("cosi10a"))).toBe(true);
    expect(shown.some((w) => w.includes("math39a") && w.includes("cosi29a"))).toBe(true);
  });
});

describe.runIf(TASK7_OPTION === "C")("Task 7 Option C: catalog search", () => {
  let app: express.Express;
  beforeAll(() => { app = buildApp(goodPlan); });

  /** Loads /courses?q=... like a browser (running the page's scripts) and returns the IDs of the rows you can see. */
  async function visibleCourses(q: string): Promise<string[]> {
    const url = q ? `/courses?q=${encodeURIComponent(q)}` : "/courses";
    const res = await request(app).get(url);
    expect(res.status).toBe(200);
    const dom = new JSDOM(res.text, { url: `http://localhost${url}`, runScripts: "dangerously" });
    await new Promise((done) => setTimeout(done, 50)); // let the page's scripts finish
    const { document } = dom.window;
    const rows = [...document.querySelectorAll("tbody tr")] as HTMLElement[];
    const visible = rows.filter((row) => !row.hidden && dom.window.getComputedStyle(row).display !== "none");
    const ids = visible.map((row) => row.querySelector("code")?.textContent?.trim() ?? "?");
    dom.window.close();
    return ids.sort();
  }

  it("with no query, shows every course", async () => {
    expect(await visibleCourses("")).toHaveLength(13);
  });

  it("matches words in the course name, ignoring case", async () => {
    expect(await visibleCourses("combinatorics")).toEqual(["math39a"]);
    expect(await visibleCourses("STRUCTURES")).toEqual(["cosi21a", "cosi29a"]);
  });

  it("matches the course ID and the department", async () => {
    expect(await visibleCourses("cosi12")).toEqual(["cosi127b", "cosi12b"].sort());
    expect(await visibleCourses("anth")).toEqual(["anth137a", "anth5a"]);
  });

  it("shows no rows when nothing matches", async () => {
    expect(await visibleCourses("underwater basket weaving")).toEqual([]);
  });
});
