# Artifact Instructions

This document describes the technical work required for HW2.

---

## Current State: The Plan Is Wrong

When you clone this repo, the planner runs from start to finish. The solver reports that it wrote a plan, and the web pages load. The plan is still wrong, and so are parts of the pages. Several tests fail. This is intentional.

**Your goal**: find out what's wrong, fix it in the layer where it starts, then extend the planner. Passing tests are a strong signal of completion, but we also value *engagement* and *understanding*. See [RUBRIC.md](RUBRIC.md) for how this work is evaluated.

---

## Setup

> **Prerequisites**: Open this repository in the course dev container. See [DOCKER.md](DOCKER.md). Run every command below in the container's terminal. Node.js, TypeScript, ESLint, Vitest, SQLite, Z3, EJS, and Express are already installed there, so there is nothing else to install (you don't need `npm install`).

Build the database, solve, and start the server:

```bash
npm run db:init    # create the database schema
npm run db:seed    # load the courses and prerequisites
npm run solve      # ask the solver for a plan and store it
npm start          # start the web server at http://localhost:3000
```

The server can keep running while you work. After you change the solver, run `npm run solve` again in a second terminal and reload the page. After you change `schema.sql` or `seed.sql`, run `npm run db:init` and `npm run db:seed` again first. If the database gets into a strange state, `npm run clean` deletes it so you can start over.

Run the tests at any time:

```bash
npm test                               # every test
npm test -- tests/invariants.test.ts   # one file
npm test -- -t "prerequisiteOrder"     # only tests whose names contain this text
npm run quality                        # lint, typecheck, and test, in that order
```

The tests don't use your `db.sqlite`. They build their own database (`test.sqlite`, or one in memory), so running them never changes the plan you're looking at.

**Lint and typecheck pass on the starter code. Keep them passing** (`npm run lint`, `npm run typecheck`). They earn no autograder points, but they count toward your artifact grade. Fix what they report instead of silencing it: `eslint-disable` and `@ts-ignore` comments are reported to course staff.

---

## Task 0: Look Around (not graded)

Before you fix anything, find out how much of what's wrong you can see on your own. Nothing is submitted for this task, but keep notes: Part 1A of [WRITTEN.md](WRITTEN.md) asks you to compare what you noticed here with what you found later.

1. **Read the pipeline**, roughly in this order:
   1. `src/db/schema.sql` and `src/db/seed.sql`: what data exists
   2. `src/db/queries.ts`: how the rest of the code reads and writes it
   3. `src/solver/types.ts` and `src/solver/constraints.ts`: how scheduling rules are written for Z3
   4. `src/solver/pipeline.ts`: how a plan gets made, step by step
   5. `src/web/routes.ts` and `src/templates/`: how the pages are built
   6. `tests/invariants.test.ts`: what "correct" means, according to the tests
2. **Use the planner the way a student would.** Run `npm run solve`, and read everything it prints. Then open the **Plan** page (<http://localhost:3000/plan>) and check it against the catalog on the **Courses** page (<http://localhost:3000/courses>). The navigation bar at the top of every page links to both. Would you sign up for this plan?
3. **Run `npm test`** and read the failures. Some belong to features you haven't built yet (Tasks 5–7); the comments above each group of tests say which task they belong to. Which of the other failures match something you saw in step 2, and which didn't you see at all?

Write down each problem you find and the layer you think it comes from. Notice also what *didn't* happen: nothing crashed, and nothing printed an error.

---

## Tasks 1–3: Follow the Failures

The rest of the failures surface one at a time: fixing one lets the next one show. Each task below tells you which failing test to start from and names the layer where the problem starts. Finding the line and deciding how to fix it is up to you.

**Fix each failure in the layer where it starts.** Code in a later layer that hides a symptom (filtering out bad rows, special-casing one course) makes a test pass without fixing anything, and the rubric treats it as a workaround.

Do these in order. The tests for Task 2 and Task 3 can't pass until the tasks before them are done.

### Task 1: The First Failure

Start from the test `all semesters are in the valid range [1, 4]` in `tests/invariants.test.ts`. This problem starts in the TypeScript that carries data between the other layers, not in SQL, Z3, or EJS.

Read the test's failure message: it names a course and the semester it ended up in. Compare that with where that course appears on the Plan page, if it appears at all.

### Task 2: The Second Failure

Start from the test `prevents a course and its prerequisite from sharing a semester`, under `prerequisiteOrder` in `tests/constraints.test.ts`. This problem starts in the constraints (Z3).

The test gives one constraint function a tiny problem, two courses and one prerequisite, and asks Z3 whether a bad schedule is still allowed. Read the constraint the way Z3 does: exactly what does it allow? The comment above a constraint says what it's *supposed* to say, and the [Z3 JavaScript documentation](https://github.com/Z3Prover/z3/blob/master/src/api/js/PUBLISHED_README.md) says what the code actually says.

### Task 3: The Third Failure

Start from the tests under `schedule invariants` in `tests/invariants.test.ts` that still fail. This problem starts in the data layer (SQL).

With Task 2 done, the constraint says the right thing, but the plan still breaks a prerequisite. The failure message names which one. Follow that prerequisite backward through the pipeline, and check at each step whether the pipeline still has it right.

When Tasks 1–3 are done, every test in `schedule invariants` and `prerequisiteOrder` passes. Run `npm run solve` again and check the Plan page against the catalog once more.

---

## Task 4: The Way the Catalog Spells It

Start from the two tests under `course names` in `tests/render.test.ts`, one for the Courses page and one for the Plan page. This problem starts in the output layer: the EJS templates, and the helpers they use in `src/web/format.ts`.

COSI 21a is "Data Structures & the Fundamentals of Computing". Find it on the Courses page, and compare what the browser shows with the HTML the server sent. To see that HTML, use your browser's **View Page Source** (Ctrl+U on Windows and Linux, Cmd+Option+U on a Mac). The failing test prints the lines of HTML around the name, too.

EJS has three tags you'll need here (the [EJS tags](https://ejs.co/#tags) list has the rest):

| Tag | What it does |
|---|---|
| `<% code %>` | Runs JavaScript, such as a loop or an `if`. Adds nothing to the page by itself. |
| `<%= value %>` | Adds `value` to the page, HTML-escaped. |
| `<%- value %>` | Adds `value` to the page exactly as it is. |

More than one fix makes these tests pass. Whichever you choose, be ready to explain why a browser now shows the name correctly, since that is what the rubric asks for.

---

## Task 5: Add a Constraint

In this task you describe a scheduling rule and let the solver find a plan that follows it. You don't write any code that searches for a plan.

A constraint function has the type `ConstraintFn` (see `src/solver/types.ts`). It gets:

- `ctx`: the Z3 context, which makes Z3 values (for example, `ctx.Int.val(3)` is the number 3)
- `vars`: a map from each course ID to a Z3 variable that stands for that course's semester
- `data`: the courses and prerequisites from the database

It returns a list of Z3 conditions, and the solver looks for a plan where all of them are true. The constraints already in `src/solver/constraints.ts` are worked examples.

### Step 1: Ask the solver a question

Before writing your own rule, try this one: "take COSI 106b in semester 3 or earlier." In `src/solver/constraints.ts`, replace `studentConstraint` with:

```ts
export const studentConstraint: ConstraintFn = (ctx, vars) => [
  vars.get("cosi106b")!.le(ctx.Int.val(3)),
];
```

Add `studentConstraint` to the `activeConstraints` list at the bottom of the file, then run `npm run solve`. The solver finds no plan at all. It says the rules can't all be true at once, but it doesn't say which ones conflict. Work out why from the prerequisites in `seed.sql`.

Now change the 3 to a 4 and solve again. This time there is a plan. Compare it with the plan from before you added the rule. So, according to our solver, the earliest semester you could take COSI 106b is semester 4. Part 2B of [WRITTEN.md](WRITTEN.md) comes back to this answer.

### Step 2: Write your own rule

Replace the COSI 106b rule with a scheduling rule of your own. Your constraint must:

- Stay named `studentConstraint` and stay in `activeConstraints` (the tests and the autograder look for it by name)
- Be your own rule, not `maxCoursesPerSemester`, which is there as a reference
- Leave the solver able to find a plan for the seed data

Some ideas:

- "Every semester has at least three courses"
- "The first semester is a light one: at most 12 credits"
- A rule that reflects how you would actually want to plan your own schedule

Run `npm run solve` and check the Plan page to see what changed.

### Step 3: Test it

At the end of `tests/invariants.test.ts` is a `describe("Task 5")` block with a placeholder. Replace the placeholder with at least one test that checks the plan follows your rule. The tests above it show the pattern: `plan` holds the rows the solver produced. Keep the name `Task 5` on the `describe` block, since the autograder finds your tests by that name.

> **Discriminatory power.** In testing, a test's discriminatory power is its ability to tell correct code from code that has something wrong with it. You can ask the same question of a constraint: does it rule out any plan the solver would otherwise pick? One quick way to find out is to remove your constraint and run your test again. If it still passes, either the test or the constraint isn't doing any work. We'll come back to this idea when we get to testing.

The autograder runs this check: it runs your Task 5 tests once with your constraint and once without it. They should pass the first time and fail the second.

### Try this (optional)

The solver returns *a* valid plan, not *the* plan. Take one of the other constraints out of `activeConstraints`, solve again, and compare the two plans. Which differences did removing the rule allow, and which just happened? Nothing in our code says which of the valid plans the solver should pick. Put everything back when you're done.

---

## Task 6: Plan Statistics

The `/stats` route in `src/web/routes.ts` already runs every query this page needs. Your job is to show the results:

1. Write `src/templates/stats.ejs`, which currently holds only a comment. Present the data clearly, using tables or the semester-block style from `plan.ejs`, and the department color coding the other pages use (`dept-badge`, `dept-COSI`, and so on).
2. Add a link to `/stats` in the navigation bar in `src/templates/_header.ejs`.

The route passes these variables to your template:

| Variable | Type | Description |
|---|---|---|
| `creditsPerSemester` | `Array<{semester, total_credits}>` | Credit load per semester |
| `coursesPerDept` | `Array<{department, course_count, total_credits}>` | Per-department summary |
| `busiestSemester` | `{semester, total_credits} \| undefined` | The semester with the highest credit load (`undefined` if there's no plan) |
| `busiestCourses` | `Array<Course>` | The courses in the busiest semester, each with `id`, `name`, `department`, and `credits` |
| `avgCreditsPerSemester` | `number` | Average credits per semester (show at least one decimal place) |

The tests list the busiest semester's courses by name, and one of those names is COSI 21a's, so this task builds on your Task 4 fix. Show course names the same way the other pages do.

The tests for this task are under `GET /stats` in `tests/render.test.ts`.

---

## Task 7: Your Feature (choose one)

Add one feature to the planner. Options A, B, and C each come with tests. Those tests check what your feature does, not how it's written, so **the language is up to you**. Each option can be written in more than one of this system's languages, and Part 2C of [WRITTEN.md](WRITTEN.md) asks about the choice you made. Make it on purpose, and keep a note of why.

First, set `TASK7_OPTION` in `src/task7.ts` to the letter you chose. The tests for Options A, B, and C are in `tests/feature.test.ts`; the ones for your option run, and the others are skipped.

### Option A: Prerequisite chains

Write `prerequisiteChain(db, courseId)` in `src/db/queries.ts`. It returns the ID of every course that must be taken before `courseId`: its prerequisites, their prerequisites, and so on, sorted. Then fill in the `/graph` route in `src/web/routes.ts` and `src/templates/graph.ejs` to show each course's chain, and add a link to `/graph` in the navigation bar.

*Language choice:* SQL can follow a chain of any length with a [recursive query](https://sqlite.org/lang_with.html#recursive_common_table_expressions), or TypeScript can follow it with a loop.

### Option B: Plan warnings

Write `planWarnings(db)` in `src/db/queries.ts`. It returns one warning for each prerequisite the stored plan breaks (a course in the same semester as a prerequisite, or earlier), and each warning names both courses. Then pass the warnings to the `/plan` page and show each one in a `.warning` block (the style is already in `_header.ejs`).

*Language choice:* SQL can find the broken prerequisites with a join, or TypeScript can find them with a loop over the plan.

### Option C: Catalog search

Make `/courses?q=...` show only the courses whose ID, name, or department contains the search text, ignoring case. The search box is already on the Courses page. With no search text, every course is shown.

*Language choice:* the server can filter the courses before it builds the page (in SQL or TypeScript), or a script in the page can hide the rows that don't match, in the browser. The tests load the page the way a browser would, running its scripts, and count the rows you can see.

### Option D: A feature of your own design

Your feature must:

- Touch at least two layers of the system (data, constraints, or web)
- Add or meaningfully extend at least one route or template
- Do one clearly bounded thing well

Option D has no tests in `feature.test.ts`; your TA grades it. At the top of the file where you did the most work, add a comment that says what your feature does, which language or languages you wrote it in and why, and one thing you deliberately chose not to include.

---

## Tips

- Run `npm run quality` often. It runs lint, typecheck, and the tests together.
- Read the whole failure message. Most of the tests here print what they expected and what they got, and some print the HTML they were looking at.
- Comment constraints in and out of `activeConstraints` to see how the plan changes. That's one of the main things this assignment is meant to show.
- Don't rename the functions and names the tests use (`runSolver`, `studentConstraint`, `activeConstraints`, `prerequisiteChain`, `planWarnings`, `TASK7_OPTION`), and don't edit the original tests. Add your own tests next to them instead: the autograder runs the original tests, and reports changed or missing ones to course staff.
- Don't modify `.github/workflows/ci.yml`: the Gradescope autograder runs the original checks regardless, and reports changes to it for course staff.

---

## File Structure

```
hw2/
├── .devcontainer/         # Docker dev environment (see DOCKER.md)
├── .github/workflows/
│   └── ci.yml             # CI workflow (run it by hand from the Actions tab; DO NOT MODIFY)
├── src/
│   ├── db/
│   │   ├── schema.sql     # table definitions
│   │   ├── seed.sql       # courses and prerequisites from the Brandeis catalog
│   │   ├── connection.ts  # opening the database and running queries
│   │   ├── migrate.ts     # npm run db:init
│   │   ├── seed.ts        # npm run db:seed
│   │   └── queries.ts     # typed query functions (Task 7 Options A and B)
│   ├── solver/
│   │   ├── types.ts       # ConstraintFn and the Z3 types
│   │   ├── constraints.ts # the constraints (Task 5 goes here)
│   │   ├── pipeline.ts    # reads the data, runs Z3, stores the plan
│   │   └── solve.ts       # npm run solve
│   ├── web/
│   │   ├── server.ts      # Express setup (npm start)
│   │   ├── routes.ts      # the pages (Tasks 6 and 7)
│   │   └── format.ts      # helpers the templates use
│   ├── templates/         # one EJS template per page, plus _header and _footer
│   │   ├── stats.ejs      # Task 6: write this
│   │   └── graph.ejs      # Task 7 Option A
│   └── task7.ts           # which Task 7 option you chose
├── tests/
│   ├── db.test.ts           # database layer
│   ├── constraints.test.ts  # one set of unit tests per constraint
│   ├── invariants.test.ts   # properties every valid plan must have (your Task 5 test goes here)
│   ├── render.test.ts       # what the pages show (Tasks 4 and 6)
│   └── feature.test.ts      # Task 7, one group of tests per option
├── eslint.config.js       # lint settings (don't loosen these)
├── tsconfig.json          # TypeScript settings (don't loosen these)
├── vitest.config.ts       # test settings
└── package.json           # npm scripts and exact package versions
```

---

## Task Summary

| Task | Kind | Layers | Description |
|------|------|--------|-------------|
| 0 | Exploration (not graded) | All | See how much of what's wrong you can find on your own |
| 1–3 | Failures | Found as you go | Trace each failure to the layer it starts in, and fix it there |
| 4 | Failure | Output | Show a course title the way the catalog spells it |
| 5 | Feature + test | Constraints, tests | Describe a scheduling rule, and test that it does something |
| 6 | Feature | Output | Show the plan statistics |
| 7 | Choice | Your choice | Build one feature, in a language you chose on purpose |
