# HW2: Constraint-Aware Course Planner

This assignment is a working (but buggy) web application that builds a four-semester course plan from a small slice of the real Brandeis course catalog. It shows a pattern that comes up again and again in software automation: at each layer of the system, you hand more of the *how* to a specialized tool and write down only *what* you want.

**ASSIGNMENT DUE DATE (all parts):** Monday, Oct 12th @ 11:59pm ET

## Learning Objectives

By completing this assignment, you will:

1. **Work in several specialized languages within one system**, and see how the work is split between what you write and what each tool works out for you (Tasks 1–4, 6, and 7)
2. **Debug a system whose parts are written in different languages**, tracing a wrong result back to where it started (Tasks 1–4)
3. **Describe a problem instead of solving it step by step**, and let a solver search for an answer, knowing there may be many valid answers or none at all (Tasks 2 and 5)
4. **Generate text for another program to read** (here, HTML for a browser), and check that what you produce fits that program's language (Tasks 4 and 6)
5. **Choose which language to write a feature in**, and weigh the tradeoff: a language that takes the *how* off your hands frees you, and it also takes some control away (Task 7 and Written Part 2C)

## Declaring what you want

The planner is built from three layers, each written in a language made for one job:

| Layer | Tool | What you declare | What the tool decides |
|---|---|---|---|
| Data | SQL (SQLite) | Which data to retrieve | How to carry out the query |
| Constraints | Z3 (an SMT solver) | Which schedules are valid | How to find one that works |
| Output | EJS templates | What the page should contain | How to produce the HTML |

TypeScript holds these layers together: it runs the queries, hands the results to the solver, stores the plan it finds, and serves the pages.

The system runs from start to finish without crashing, and the plan it shows looks reasonable at first glance. It is wrong anyway. [ARTIFACT.md](ARTIFACT.md) starts by having you look around before you fix anything, and then walks you through the failures one at a time.

---

## CI/CD

**Continuous Integration / Continuous Delivery (CI/CD)** refers to the practice of automatically running checks (linting, type-checking, tests) whenever code changes are pushed to a shared repository. In this project, CI is implemented with **GitHub Actions**, which defines a set of automated jobs in a workflow file ([`ci.yml`](.github/workflows/ci.yml)). Each job runs inside the same Docker image you develop in, and Gradescope runs the same checks when you submit. As in HW1, reading the workflow file is the most reliable way to know exactly which commands CI runs.

### Running CI on GitHub

In most projects, CI runs automatically every time someone pushes. **In this course it only runs when you start it yourself.** Your repository is private, and GitHub Actions minutes for private repositories come out of your personal GitHub account's free monthly quota, which you may need for other courses. So do your checking in the container, and run CI on GitHub when you want to confirm your pushed work.

**Run the CI checks locally before you push.** The commands CI runs are listed in [`ci.yml`](.github/workflows/ci.yml), and every one of them works the same way in your container. Then, to run CI on GitHub:

1. Push your commits to GitHub.
2. On your repository's GitHub page, open the **Actions** tab.
3. Choose the **CI** workflow in the list on the left.
4. Click **Run workflow**, keep the branch set to `main`, and click the green **Run workflow** button.
5. After a few seconds a new run appears; click it to watch each job and read its output.

Each run uses a few minutes of your quota, so run it when you have something to confirm, not after every commit. The comments at the top of [`ci.yml`](.github/workflows/ci.yml) show what the usual automatic trigger looks like.

---

## Assignment Structure

This assignment has three parts:

| Part | Where | Description |
|------|-------|-------------|
| **Artifact** | [ARTIFACT.md](ARTIFACT.md) | Fix the planner and extend it; submitted to **HW2 Artifact** on Gradescope |
| **Written Reflection** | [WRITTEN.md](WRITTEN.md) | Reflect on your process and connect it to the readings; submitted to **HW2 Written** on Gradescope |
| **AI Usage Report** | [HW2 AI usage reporting tool](https://genai.cs.brandeis.edu/prompt/650f9cb5-f8d4-4d8e-a9e1-13f634c0e3f0) | Required **even if you didn't use AI** |

**Complete the artifact first**, then write your reflection. The written component asks you to reflect on your experience completing the artifact, so it should be done after the artifact.

AI usage reporting should come last. Full instructions for reporting AI usage can be found on Moodle.

---

## Required Reading

Before starting the written reflection, read:

- **John Backus, "Can Programming Be Liberated from the Von Neumann Style?"** (Turing Award Lecture, 1978). Read from the beginning through the section "What Are the Alternatives to von Neumann Languages?" You do not need to read further.

  One section ("Comparison of von Neumann and Functional Programs") includes a worked example in a notation you have probably not seen before. You do not need to understand the functional syntax. Focus on the bulleted list of properties that follows the example.
- **Ivan Illich, "Two Watersheds"** (Chapter 1 of *Tools for Conviviality*, 1973), provided on Moodle

This reading is essential for the written reflection.

---

## Prerequisites & Setup

### Getting your repository

You work in your own **private** copy of the assignment:

1. Go to <https://github.com/brandeis-cosi-106b/hw2-fa26> and click **Use this template → Create a new repository**.
2. Set **Owner** to your own GitHub account, name it (for example `cosi106b-hw2`), and choose **Private**. Your repository must be private, since public repositories let other students see your work.
3. Click **Create repository**, then clone *your* new repository (not `brandeis-cosi-106b/hw2-fa26`) to your computer.

Your copy starts with a single commit and isn't linked to the course repository, so it won't receive changes automatically. See [Required updates](#required-updates) for how to get them.

### Required updates

If bugs in the assignment are discovered after release, course staff may publish fixes. **Applying them is required.** They will be announced with one or more commit IDs. In your repository, inside the container terminal:

```bash
git remote add upstream https://github.com/brandeis-cosi-106b/hw2-fa26.git   # first time only
git fetch upstream
git cherry-pick <commit-id>          # as announced
git push
```

If Git reports a conflict, it's because you edited the same lines as the fix. Open the listed files, keep both your work and the fix, then run `git add <file>` and `git cherry-pick --continue`. Don't use `git merge` or `git pull` with `upstream`: your repository shares no history with it, so every file you changed would conflict. The Gradescope autograder always checks against the updated version, so a fix you skip can make it fail.

### Tools

As in HW1, all work happens inside a **Docker development container** with every tool preinstalled (Node.js 22, TypeScript, ESLint, Vitest, SQLite, the Z3 solver, EJS, and Express), at exactly the versions that GitHub Actions and Gradescope use. You **don't** need to install any of them yourself, and you don't need to run `npm install`.

**Follow [DOCKER.md](DOCKER.md) to get set up.** If you set up Docker Desktop and VS Code for HW1, you already have everything; open this repository in its container the same way. If Docker won't run on your computer, DOCKER.md describes a browser-based fallback.

Once your container is open, check in its terminal that everything is there:

```bash
node --version
eslint --version
tsc --version
```

> **Prefer to install tools natively?** You can, but it's unsupported: if your
> results differ from CI or Gradescope, the container is the reference. The
> exact versions are pinned in [`package-lock.json`](package-lock.json) and
> [`.devcontainer/install-tools.sh`](.devcontainer/install-tools.sh).

### Running the planner

In the container terminal:

```bash
npm run db:init    # create the database schema
npm run db:seed    # load the courses and prerequisites
npm run solve      # ask the solver for a plan and store it
npm start          # start the web server
```

Then open <http://localhost:3000> in your browser. VS Code forwards the port from the container for you. Stop the server with Ctrl+C.

### npm scripts and Makefile targets

In HW1, the Makefile gave short names to longer commands, so `make run-all` ran the whole pipeline. JavaScript projects usually do the same job with the `"scripts"` section of [`package.json`](package.json): `npm run solve` runs whatever command is listed under `"solve"`. The idea is the same, and so is the rule from HW1's CI: CI and the autograder call the tools directly (`eslint`, `tsc`, `vitest`) rather than going through `npm run`, so reading [`ci.yml`](.github/workflows/ci.yml) tells you exactly what gets run.

| Command | What it does |
|---|---|
| `npm run db:init` | Create the database schema |
| `npm run db:seed` | Load courses and prerequisites |
| `npm run solve` | Run Z3 and write the plan to the database |
| `npm start` | Start the web server on port 3000 |
| `npm test` | Run the test suite (Vitest) |
| `npm run lint` | Lint with ESLint |
| `npm run typecheck` | Type-check with `tsc` |
| `npm run quality` | Lint, typecheck, and test, in that order |
| `npm run clean` | Delete the database files |

---

## Architecture

```
src/
  db/
    schema.sql        table definitions
    seed.sql          courses and prerequisites from the Brandeis catalog
    connection.ts     opening and closing the database, running queries
    migrate.ts        runs schema.sql (npm run db:init)
    seed.ts           runs seed.sql (npm run db:seed)
    queries.ts        typed query functions used by the other layers
  solver/
    types.ts          shared TypeScript types for the solver layer
    constraints.ts    the constraint functions (your Task 5 constraint goes here)
    pipeline.ts       gathers the data and constraints, runs Z3, reads back the plan
    solve.ts          command-line entry point (npm run solve)
  web/
    server.ts         Express server setup
    routes.ts         the pages: /, /courses, /plan, /stats, /graph
    format.ts         helpers the templates use to display values
  templates/          EJS templates, one per page, plus a shared header and footer
  task7.ts            which Task 7 option you chose
tests/
  db.test.ts          database layer
  constraints.test.ts one set of unit tests per constraint function
  invariants.test.ts  properties every valid plan must have (your Task 5 test goes here)
  render.test.ts      what the pages show
  feature.test.ts     Task 7, one group of tests per option
```

## How the Solver Works

`src/solver/constraints.ts` defines named constraint functions. Each one returns a list of Z3 boolean assertions. The solver collects every assertion from the functions listed in `activeConstraints`, asks Z3 for an assignment of courses to semesters that satisfies all of them, and writes the result to the database.

To turn a constraint off, comment it out of `activeConstraints`. To add one, write a function that matches the `ConstraintFn` type and add it to the list.

The web server reads the database again for each request, so you can leave it running while you run `npm run solve` in a second terminal and then reload the page.

---

## Grading

This assignment is evaluated using **two independent letter grades**:

| Grade | Evaluates |
|-------|-----------|
| **Artifact Grade** | Technical execution, engagement with the tools, good-faith effort |
| **Reflection Grade** | Theory-building, honest self-assessment, engagement with course ideas |

These grades are **not mechanically averaged**. Strong performance in one area does not automatically make up for the other, though a strong written reflection can partially offset incomplete technical work.

**See [RUBRIC.md](RUBRIC.md) for detailed grading criteria.**

### What We're Looking For

**Artifact**: Aim for passing tests, but we also value *engagement* and *intentionality*. Did you fix each failure in the layer where it started, or work around it further along? Can you explain why your fixes work? Did you choose the language for your Task 7 feature on purpose? The self-assessment in your written reflection helps us see this.

**Reflection**: We value honesty, specificity, and real engagement with course ideas, especially the readings for this assignment listed above. A thoughtful reflection on partial success is more valuable than a superficial reflection on complete success.

### CI Jobs

The following CI jobs run each time you run the CI workflow (see [Running CI on GitHub](#running-ci-on-github)):

1. **quality**: `eslint` and `tsc` pass with no errors
2. **tests**: the database builds, and all Vitest tests pass

Passing all CI jobs is a strong signal of artifact completion, but it is not the sole criterion for grading.

### Gradescope Autograder

When you submit your artifact to Gradescope, it runs the **same checks** as the CI jobs above, one Gradescope test per CI step, and shows you the exact command and its output for each. It also has one test for each of Tasks 1–7. A few things work differently from GitHub Actions:

- Every check runs, even if an earlier one fails, so you get feedback on everything at once.
- The autograder runs the **original** tests and the original ESLint, TypeScript, and Vitest settings. Editing the original tests or loosening the settings won't change your autograder results (and will be visible to course staff).
- The tests you add to `tests/` run as a separate check. For Task 5, the autograder checks your test's **discriminatory power**, meaning whether it can tell a plan made with your constraint from a plan made without it. The same idea applies to the constraint itself. A constraint that rules out no plan the solver would otherwise accept changes nothing, and no test can tell whether it's there.
- Lint and typecheck are reported but earn no autograder points, since they already pass on the starter code. **Keep following the lint and typecheck instructions anyway**: they count toward your artifact grade.

The autograder score is **not** your artifact grade. It's one piece of evidence course staff use alongside [RUBRIC.md](RUBRIC.md).

---

## AI Tools Policy

You may use automation tools to help with this assignment, including both LLM-powered tools and "older" automations (e.g., those built into your IDE). You must document your usage in the written reflection (Part 1B) and in the AI usage report (see [Assignment Structure](#assignment-structure)).

LLM tools can help you understand unfamiliar APIs and error messages, but they can also produce plausible-looking code that is subtly wrong. This is especially true for Z3 constraints, where a mistake may not be obvious until you reason carefully about what the constraint actually says. Documentation is still your friend; see [Resources](#resources).

**Remember**: LLM tools can also help you write code, but you need to understand what it's doing. The written reflection will ask you to reflect on how you used these tools, and you may be asked about your submission in an oral exam.

---

## Submission

Your final repository should contain:

| File | Description |
|------|-------------|
| **All source files** | With the failures fixed and Tasks 4–7 implemented |
| **Your Task 5 constraint and test** | In `src/solver/constraints.ts` and `tests/invariants.test.ts` |
| **`src/templates/stats.ejs`** | Your Task 6 dashboard |
| **`src/task7.ts`** | Set to the Task 7 option you chose |

### How to Submit

0. Review [RUBRIC.md](RUBRIC.md) to understand how you'll be evaluated
1. Complete the tasks in [ARTIFACT.md](ARTIFACT.md) (aim for all CI checks to pass)
2. Commit and push:

```bash
git add -A
git commit -m "Complete HW2: course planner"
git push
```

3. Run the CI workflow on GitHub ([Running CI on GitHub](#running-ci-on-github)) and confirm all jobs pass.

4. Submit your **artifact** on Gradescope: open the **HW2 Artifact** assignment, choose **GitHub** as the submission method, and select your HW2 repository and the `main` branch. The autograder results appear within a few minutes. You can resubmit as many times as you like before the deadline; your last submission is the one graded.

5. Complete the written reflection in [WRITTEN.md](WRITTEN.md) (including the self-assessment), then upload your completed `WRITTEN.md` to the **HW2 Written** assignment on Gradescope.

6. Submit your AI usage report through the [HW2 AI usage reporting tool](https://genai.cs.brandeis.edu/prompt/650f9cb5-f8d4-4d8e-a9e1-13f634c0e3f0), **even if you didn't use AI**. Full instructions for reporting AI usage can be found on Moodle.

---

## Resources

- [Z3 JavaScript bindings (`z3-solver`)](https://github.com/Z3Prover/z3/blob/master/src/api/js/PUBLISHED_README.md) and the [Z3 guide](https://microsoft.github.io/z3guide/docs/logic/intro/), which explains what the solver does with your constraints
- [SQLite SQL reference](https://sqlite.org/lang.html) and the [better-sqlite3 API](https://github.com/WiseLibs/better-sqlite3/blob/master/docs/api.md)
- [EJS documentation](https://ejs.co/#docs), including its [tags](https://ejs.co/#tags)
- [Express documentation](https://expressjs.com/)
- [Vitest documentation](https://vitest.dev/)
- [ESLint documentation](https://eslint.org/docs/latest/) and the [TypeScript handbook](https://www.typescriptlang.org/docs/handbook/intro.html)
