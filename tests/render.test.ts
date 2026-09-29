/**
 * render.test.ts — smoke tests for the web routes.
 *
 * These tests start an Express server against a small test database
 * (test.sqlite) and check that each route returns HTML with the expected
 * content, as a browser would show it.
 */

import express from "express";
import request from "supertest";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { JSDOM } from "jsdom";
import { beforeAll, describe, expect, it } from "vitest";
import { registerRoutes } from "../src/web/routes.js";
import { closeDb, DB_FILE, openDb, run } from "../src/db/connection.js";
import { clearAndInsertPlan } from "../src/db/queries.js";

const __dirname = dirname(fileURLToPath(import.meta.url));

let app: express.Express;

/** The page as a browser would load it (scripts don't run). */
function page(html: string): Document {
  return new JSDOM(html).window.document;
}

/** The text a browser shows for this HTML, with runs of whitespace collapsed. */
function visibleText(html: string): string {
  return (page(html).body.textContent ?? "").replace(/\s+/g, " ");
}

/** The lines of HTML that contain `text`, to show in a failure message. */
function htmlAround(html: string, text: string): string {
  const lines = html.split("\n").filter((line) => line.includes(text));
  return lines.length ? lines.map((line) => `  ${line.trim()}`).join("\n") : `  (no line contains "${text}")`;
}

beforeAll(() => {
  app = express();
  app.set("view engine", "ejs");
  app.set("views", resolve(__dirname, "../src/templates"));

  // Build the test database (DB_FILE is test.sqlite while tests run).
  const db = openDb(DB_FILE);
  run(db, readFileSync(resolve(__dirname, "../src/db/schema.sql"), "utf-8"));
  run(db, readFileSync(resolve(__dirname, "../src/db/seed.sql"), "utf-8"));
  clearAndInsertPlan(db, [
    { course_id: "math10a", semester: 1 },
    { course_id: "cosi10a", semester: 1 },
    { course_id: "cosi12b", semester: 2 },
    { course_id: "math15a", semester: 2 },
    { course_id: "cosi21a", semester: 3 },
    { course_id: "cosi29a", semester: 3 },
    { course_id: "anth5a", semester: 3 },
  ]);
  closeDb(db);

  registerRoutes(app);
});

describe("GET /", () => {
  it("returns 200 and contains 'Course Planner'", async () => {
    const res = await request(app).get("/");
    expect(res.status).toBe(200);
    expect(res.text).toContain("Course Planner");
  });
});

describe("GET /courses", () => {
  it("returns 200 and lists course IDs", async () => {
    const res = await request(app).get("/courses");
    expect(res.status).toBe(200);
    expect(res.text).toContain("cosi10a");
    expect(res.text).toContain("math10a");
  });

  it("shows prerequisite relationships", async () => {
    const res = await request(app).get("/courses");
    expect(res.text).toContain("cosi10a"); // appears as prereq of cosi12b
  });
});

describe("GET /plan", () => {
  it("returns 200 and shows semester headings", async () => {
    const res = await request(app).get("/plan");
    expect(res.status).toBe(200);
    expect(res.text).toContain("Semester 1");
    expect(res.text).toContain("Semester 2");
  });

  it("includes course IDs in the plan", async () => {
    const res = await request(app).get("/plan");
    expect(res.text).toContain("math10a");
    expect(res.text).toContain("cosi12b");
  });
});

// Task 4
describe("course names", () => {
  const name = "Data Structures & the Fundamentals of Computing";

  it.each(["/courses", "/plan"])("%s shows cosi21a's name the way the catalog spells it", async (path) => {
    const res = await request(app).get(path);
    expect(
      visibleText(res.text),
      `A browser shows something else for this HTML:\n${htmlAround(res.text, "Data Structures")}\n`,
    ).toContain(name);
  });
});

// Task 6
describe("GET /stats", () => {
  it("is linked from the navigation bar", async () => {
    const res = await request(app).get("/");
    expect(page(res.text).querySelector('nav a[href="/stats"]'), "no <a href=\"/stats\"> in the <nav>").not.toBeNull();
  });

  it("returns 200 and shows each department in the plan", async () => {
    const res = await request(app).get("/stats");
    expect(res.status).toBe(200);
    const text = visibleText(res.text);
    for (const dept of ["ANTH", "COSI", "MATH"]) expect(text).toContain(dept);
  });

  it("shows the busiest semester's credits and the average credits per semester", async () => {
    // The test plan has 8, 8, and 12 credits: the busiest has 12, the average is 9.33...
    const text = visibleText((await request(app).get("/stats")).text);
    expect(text).toMatch(/\b12\b/);
    expect(text).toMatch(/\b9\.3/);
  });

  it("lists the busiest semester's courses by name", async () => {
    const res = await request(app).get("/stats");
    const text = visibleText(res.text);
    for (const name of ["Discrete Structures", "Human Origins"]) expect(text).toContain(name);
    const cosi21a = "Data Structures & the Fundamentals of Computing";
    expect(text, `A browser shows something else for this HTML:\n${htmlAround(res.text, "Data Structures")}\n`).toContain(cosi21a);
  });
});
