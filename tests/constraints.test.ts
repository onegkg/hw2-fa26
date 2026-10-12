/**
 * constraints.test.ts — unit tests for individual constraint functions.
 *
 * These tests exercise each constraint in isolation using a tiny synthetic
 * problem, so they run quickly and pinpoint exactly which constraint is broken.
 */

import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { init } from "z3-solver";
import { beforeAll, describe, expect, it } from "vitest";
import { closeDb, openDb, run } from "../src/db/connection.js";
import { getCourses, getPrerequisites } from "../src/db/queries.js";
import {
    activeConstraints,
    maxCoursesPerSemester,
    prerequisiteOrder,
    semesterBounds,
    semesterCreditLimit,
    studentConstraint,
} from "../src/solver/constraints.js";
import type { ConstraintData } from "../src/solver/types.js";

const __dirname = dirname(fileURLToPath(import.meta.url));

// z3-solver's Context type is complex and parameterized; 'any' is intentional here.
let ctx: any;

beforeAll(async () => {
    const { Context } = await init();
    ctx = new Context("main");
});

function makeVars(ids: string[]): Map<string, any> {
    return new Map(ids.map((id) => [id, ctx.Int.const(`sem_${id}`)]));
}

describe("semesterBounds", () => {
    it("rejects a semester value of 0", async () => {
        const vars = makeVars(["a"]);
        const solver = new ctx.Solver();
        for (const a of semesterBounds(ctx, vars, { courses: [{ id: "a", credits: 4, name: "A", department: "X" }], prereqs: [] })) {
            solver.add(a);
        }
        solver.add(vars.get("a")!.eq(ctx.Int.val(0)));
        expect(await solver.check()).toBe("unsat");
    });

    it("rejects a semester value of 5", async () => {
        const vars = makeVars(["a"]);
        const solver = new ctx.Solver();
        for (const a of semesterBounds(ctx, vars, { courses: [{ id: "a", credits: 4, name: "A", department: "X" }], prereqs: [] })) {
            solver.add(a);
        }
        solver.add(vars.get("a")!.eq(ctx.Int.val(5)));
        expect(await solver.check()).toBe("unsat");
    });
});

describe("prerequisiteOrder", () => {
    it("prevents a course and its prerequisite from sharing a semester", async () => {
        const vars = makeVars(["prereq", "course"]);
        const data: ConstraintData = {
            courses: [
                { id: "prereq", credits: 3, name: "Prereq", department: "X" },
                { id: "course", credits: 3, name: "Course", department: "X" },
            ],
            prereqs: [{ course_id: "course", prereq_id: "prereq" }],
        };

        const solver = new ctx.Solver();
        for (const a of prerequisiteOrder(ctx, vars, data)) {
            solver.add(a);
        }

        // Force both into semester 1: "unsat" means the constraint rules that out.
        solver.add(vars.get("prereq")!.eq(ctx.Int.val(1)));
        solver.add(vars.get("course")!.eq(ctx.Int.val(1)));

        expect(await solver.check()).toBe("unsat");
    });

    it("allows the prerequisite in an earlier semester", async () => {
        const vars = makeVars(["prereq", "course"]);
        const data: ConstraintData = {
            courses: [
                { id: "prereq", credits: 3, name: "Prereq", department: "X" },
                { id: "course", credits: 3, name: "Course", department: "X" },
            ],
            prereqs: [{ course_id: "course", prereq_id: "prereq" }],
        };

        const solver = new ctx.Solver();
        for (const a of prerequisiteOrder(ctx, vars, data)) {
            solver.add(a);
        }
        solver.add(vars.get("prereq")!.eq(ctx.Int.val(1)));
        solver.add(vars.get("course")!.eq(ctx.Int.val(2)));
        expect(await solver.check()).toBe("sat");
    });
});

describe("semesterCreditLimit", () => {
    it("rejects a semester with more than 18 credits", async () => {
        // Five 4-credit courses all in semester 1 = 20 credits → should be unsat.
        const ids = ["a", "b", "c", "d", "e"];
        const vars = makeVars(ids);
        const courses = ids.map((id) => ({ id, credits: 4, name: id, department: "X" }));
        const data: ConstraintData = { courses, prereqs: [] };

        const solver = new ctx.Solver();
        for (const a of semesterCreditLimit(ctx, vars, data)) {
            solver.add(a);
        }
        for (const id of ids) {
            solver.add(vars.get(id)!.eq(ctx.Int.val(1)));
        }
        expect(await solver.check()).toBe("unsat");
    });
});

// Task 5: checks that your constraint is written and switched on. Your own
// test (in invariants.test.ts) checks that the plan follows it.
describe("studentConstraint", () => {
    it("is one of the activeConstraints", () => {
        expect(activeConstraints, "Add studentConstraint to activeConstraints").toContain(studentConstraint);
    });

    it("is your own rule, not maxCoursesPerSemester", () => {
        expect(studentConstraint).not.toBe(maxCoursesPerSemester);
    });

    it("adds at least one rule for the seeded courses", () => {
        const db = openDb(":memory:");
        run(db, readFileSync(resolve(__dirname, "../src/db/schema.sql"), "utf-8"));
        run(db, readFileSync(resolve(__dirname, "../src/db/seed.sql"), "utf-8"));
        const data: ConstraintData = { courses: getCourses(db), prereqs: getPrerequisites(db) };
        closeDb(db);

        const vars = makeVars(data.courses.map((c) => c.id));
        expect(studentConstraint(ctx, vars, data).length).toBeGreaterThan(0);
    });
});
