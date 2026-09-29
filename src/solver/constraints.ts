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
  data.prereqs.map(({ course_id, prereq_id }) =>
    vars.get(prereq_id)!.le(vars.get(course_id)!),
  );

/**
 * The total credit load in any single semester must not exceed 18 credits.
 */
export const semesterCreditLimit: ConstraintFn = (ctx, vars, data) => {
  const MAX_CREDITS = 18;
  return Array.from({ length: 4 }, (_, i) => {
    const s = i + 1;
    const terms = data.courses.map((c) =>
      ctx.If(vars.get(c.id)!.eq(ctx.Int.val(s)), ctx.Int.val(c.credits), ctx.Int.val(0)),
    );
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
      ctx.If(vars.get(c.id)!.eq(ctx.Int.val(s)), ctx.Int.val(1), ctx.Int.val(0)),
    );
    const count = terms.reduce((acc: any, x) => acc.add(x));
    return count.le(ctx.Int.val(MAX_COURSES));
  });
};

/**
 * Task 5: your constraint. Replace this with a scheduling rule of your own
 * (the comment above each constraint says what its rule is), then add it to
 * activeConstraints.
 */
export const studentConstraint: ConstraintFn = () => [];

// ---------------------------------------------------------------------------
// Toggle constraints by commenting entries in or out.
// The solver applies exactly these constraints — no more, no less.
// ---------------------------------------------------------------------------

export const activeConstraints: ConstraintFn[] = [
  semesterBounds,
  prerequisiteOrder,
  semesterCreditLimit,
  // maxCoursesPerSemester,
];
