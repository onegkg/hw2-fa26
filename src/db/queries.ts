import { all, run, transaction } from "./connection.js";
import type { Db } from "./connection.js";

export interface Course {
  id: string;
  name: string;
  credits: number;
  department: string;
}

export interface Prerequisite {
  course_id: string;
  prereq_id: string;
}

export interface PlanRow {
  course_id: string;
  semester: number;
}

export function getCourses(db: Db): Course[] {
  return all<Course>(db, "SELECT * FROM courses ORDER BY department, id");
}

export function getPrerequisites(db: Db): Prerequisite[] {
  return all<Prerequisite>(db, "SELECT course_id, prereq_id FROM prerequisites");
}

export function getPlan(db: Db): PlanRow[] {
  return all<PlanRow>(
    db,
    `SELECT p.course_id, p.semester, c.name, c.credits, c.department
     FROM plan p
     JOIN courses c ON c.id = p.course_id
     ORDER BY p.semester, p.course_id`,
  );
}

export function clearAndInsertPlan(db: Db, rows: PlanRow[]): void {
  transaction(db, () => {
    run(db, "DELETE FROM plan");
    for (const row of rows) {
      run(db, "INSERT INTO plan (course_id, semester) VALUES (?, ?)", [row.course_id, row.semester]);
    }
  });
}

/**
 * Task 7 Option A: the IDs of every course that must be taken before
 * `courseId` (its prerequisites, their prerequisites, and so on), sorted.
 */
export function prerequisiteChain(_db: Db, _courseId: string): string[] {
  throw new Error("Task 7 Option A: not written yet");
}

/**
 * Task 7 Option B: one warning for each prerequisite the plan breaks,
 * naming both courses.
 */
export function planWarnings(_db: Db): string[] {
  throw new Error("Task 7 Option B: not written yet");
}
