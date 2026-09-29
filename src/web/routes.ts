import type { Express, Request, Response } from "express";
import { all, get, withDb } from "../db/connection.js";
import { getCourses, getPlan } from "../db/queries.js";
import type { Course, PlanRow } from "../db/queries.js";
import { courseTitle } from "./format.js";

export function registerRoutes(app: Express): void {
  // Helpers every template can use (see format.ts)
  app.locals.courseTitle = courseTitle;

  app.get("/", (_req: Request, res: Response) => {
    res.render("index", { title: "Course Planner" });
  });

  // Task 7 Option C: /courses?q=... shows only the courses that match q.
  app.get("/courses", (_req: Request, res: Response) => {
    const [courses, prereqRows] = withDb((db) => [
      getCourses(db),
      // Build a prereq map: course_id → list of prereq course objects
      all<{ course_id: string; id: string; name: string }>(
        db,
        `SELECT p.course_id, c.id, c.name
         FROM prerequisites p
         JOIN courses c ON c.id = p.prereq_id
         ORDER BY p.course_id`,
      ),
    ] as const);

    const prereqMap = new Map<string, Array<{ id: string; name: string }>>();
    for (const row of prereqRows) {
      const list = prereqMap.get(row.course_id) ?? [];
      list.push({ id: row.id, name: row.name });
      prereqMap.set(row.course_id, list);
    }

    const coursesWithPrereqs = courses.map((c) => ({
      ...c,
      prereqs: prereqMap.get(c.id) ?? [],
    }));

    res.render("courses", { title: "Course Catalog", courses: coursesWithPrereqs });
  });

  app.get("/plan", (_req: Request, res: Response) => {
    const [planRows, prereqRows] = withDb((db) => [
      getPlan(db),
      // Fetch prerequisite data for each course
      all<{ course_id: string; prereq_id: string }>(
        db,
        `SELECT course_id, prereq_id
         FROM prerequisites
         ORDER BY course_id`,
      ),
    ] as const);

    if (planRows.length === 0) {
      res.render("plan", { title: "Generated Plan", semesters: [], empty: true });
      return;
    }

    const prereqMap = new Map<string, string[]>();
    for (const row of prereqRows) {
      const list = prereqMap.get(row.course_id) ?? [];
      list.push(row.prereq_id);
      prereqMap.set(row.course_id, list);
    }

    // Group courses by semester for display
    const semesterMap = new Map<number, PlanRow[]>();
    for (const row of planRows) {
      const list = semesterMap.get(row.semester) ?? [];
      list.push(row);
      semesterMap.set(row.semester, list);
    }

    const semesters = Array.from(semesterMap.entries())
      .sort(([a], [b]) => a - b)
      .map(([num, courses]) => ({
        number: num,
        courses: (courses as Array<Course & PlanRow>).map((c) => ({
          ...c,
          prereqs: prereqMap.get(c.course_id) ?? [],
        })),
        totalCredits: (courses as Array<Course & PlanRow>).reduce(
          (sum, c) => sum + c.credits,
          0,
        ),
      }));

    // Task 7 Option B: pass planWarnings() to the template as `warnings`.

    res.render("plan", { title: "Generated Plan", semesters, empty: false });
  });

  // Task 6: analytics dashboard. These queries are written; show their results
  // in stats.ejs.
  app.get("/stats", (_req: Request, res: Response) => {
    const { creditsPerSemester, coursesPerDept, busiestSemester, avgResult, busiestCourses } = withDb((db) => {
      const busiestSemester = get<{ semester: number; total_credits: number }>(
        db,
        `SELECT p.semester, SUM(c.credits) AS total_credits
         FROM plan p
         JOIN courses c ON c.id = p.course_id
         GROUP BY p.semester
         ORDER BY total_credits DESC, p.semester
         LIMIT 1`,
      );
      return {
        creditsPerSemester: all<{ semester: number; total_credits: number }>(
          db,
          `SELECT p.semester, SUM(c.credits) AS total_credits
           FROM plan p
           JOIN courses c ON c.id = p.course_id
           GROUP BY p.semester
           ORDER BY p.semester`,
        ),

        coursesPerDept: all<{ department: string; course_count: number; total_credits: number }>(
          db,
          `SELECT c.department, COUNT(*) AS course_count, SUM(c.credits) AS total_credits
           FROM plan p
           JOIN courses c ON c.id = p.course_id
           GROUP BY c.department
           ORDER BY c.department`,
        ),

        busiestSemester,

        avgResult: get<{ avg_credits: number }>(
          db,
          `SELECT AVG(sem_total) AS avg_credits
           FROM (
             SELECT SUM(c.credits) AS sem_total
             FROM plan p
             JOIN courses c ON c.id = p.course_id
             GROUP BY p.semester
           )`,
        ),

        busiestCourses: busiestSemester
          ? all<Course>(
              db,
              `SELECT c.*
               FROM plan p
               JOIN courses c ON c.id = p.course_id
               WHERE p.semester = ?
               ORDER BY c.department, c.id`,
              [busiestSemester.semester],
            )
          : [],
      };
    });

    res.render("stats", {
      title: "Plan Statistics",
      creditsPerSemester,
      coursesPerDept,
      busiestSemester,
      busiestCourses,
      avgCreditsPerSemester: avgResult?.avg_credits ?? 0,
    });
  });

  // Task 7 Option A: fill in this route to show each course's prerequisite chain.
  app.get("/graph", (_req: Request, res: Response) => {
    // Query the prerequisites and courses tables here (inside withDb, like the
    // routes above), then pass data to graph.ejs.
    res.render("graph", { title: "Prerequisite Graph" });
  });
}
