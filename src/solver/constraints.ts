/**
 * constraints.ts — the constraint language for the course planner.
 *
 * Each exported function defines one scheduling rule. The solver applies
 * whatever is listed in `activeConstraints` — comment entries in or out
 * to see how the generated plan changes.
 *
 * To add a new constraint, follow the same pattern: write a function
 * matching the ConstraintFn signature, then add it to activeConstraints.
 */

import type { ConstraintFn } from "./types.js";

/**
 * Every course must be placed in a valid semester (1–4).
 */
export const semesterBounds: ConstraintFn = (ctx, vars, data) =>
    data.courses.flatMap((course) => {
        const s = vars.get(course.id)!;
        return [s.ge(ctx.Int.val(1)), s.le(ctx.Int.val(4))];
    });

/**
 * Each prerequisite must be completed in a strictly earlier semester than
 * the course that requires it.
 */
export const prerequisiteOrder: ConstraintFn = (ctx, vars, data) =>
    // task 2
    data.prereqs.map(({ course_id, prereq_id }) =>
        vars.get(prereq_id)!.lt(vars.get(course_id)!), // should be less than not le
    );

/**
 * The total credit load in any single semester must not exceed 18 credits.
 */
export const semesterCreditLimit: ConstraintFn = (ctx, vars, data) => {
    const MAX_CREDITS = 18;
    return Array.from({ length: 4 }, (_, i) => {
        // semester
        const s = i + 1;
        const terms = data.courses.map((c) =>
            // if course is in the current semester, add its credits, otherwise 0
            ctx.If(vars.get(c.id)!.eq(ctx.Int.val(s)), ctx.Int.val(c.credits), ctx.Int.val(0)),
        );
        // sum the credits
        const total = terms.reduce((acc: any, x) => acc.add(x));
        return total.le(ctx.Int.val(MAX_CREDITS));
    });
};

/**
 * No semester may contain more than 4 courses.
 * Currently inactive — add it to activeConstraints to enable it.
 */
export const maxCoursesPerSemester: ConstraintFn = (ctx, vars, data) => {
    const MAX_COURSES = 4;
    return Array.from({ length: 4 }, (_, i) => {
        const s = i + 1;
        const terms = data.courses.map((c) =>
            // if course is in the current semester, add one, else don't
            ctx.If(vars.get(c.id)!.eq(ctx.Int.val(s)), ctx.Int.val(1), ctx.Int.val(0)),
        );
        const count = terms.reduce((acc: any, x) => acc.add(x));
        return count.le(ctx.Int.val(MAX_COURSES));
    });
};

/**
    * No semester may have more than one course from the MATH department
 */
export const studentConstraint: ConstraintFn = (ctx, vars, data) => Array.from({ length: 4 }, (_, i) => {
    // get semester number
    const s = i + 1;
    const terms = data.courses.map((c) => ctx.If(vars.get(c.id)!.eq(ctx.Int.val(s)), c.department === "MATH" ? ctx.Int.val(1) : ctx.Int.val(0), ctx.Int.val(0)));
    const count = terms.reduce((acc: any, x) => acc.add(x));
    return count.le(ctx.Int.val(1));
})


// ---------------------------------------------------------------------------
// Toggle constraints by commenting entries in or out.
// The solver applies exactly these constraints — no more, no less.
// ---------------------------------------------------------------------------

export const activeConstraints: ConstraintFn[] = [
    semesterBounds,
    prerequisiteOrder,
    semesterCreditLimit,
    // maxCoursesPerSemester,
    studentConstraint
];
