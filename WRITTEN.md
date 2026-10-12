# HW2 Written Reflection

Answer the following questions thoughtfully. There are no "right" answers. The goal is honest reflection on your experience and on the ideas from class.

This written component is designed to reward **honest engagement and theory-building**, even if your artifact is incomplete. A working planner without understanding and a partial planner with deep understanding are *not* the same thing, but both can be discussed thoughtfully here.

---

## Part 0: Self-Assessment

Complete this section **before** writing your reflection. Be honest. This is not penalized, and it helps us calibrate grading. Accurate self-assessment demonstrates the kind of self-awareness we value.

### Artifact Completion

For each task, mark your status: **Done**, **Partial**, or **Not Done**. Add brief notes if helpful.

| Task | Status | Notes (optional) |
|------|--------|------------------|
| 0. Looked around before fixing anything | done | |
| 1. First failure fixed (the semester-range test passes) | done | |
| 2. Second failure fixed (the `prerequisiteOrder` tests pass) | done | |
| 3. Third failure fixed (every schedule invariant test passes) | done | |
| 4. Course titles appear the way the catalog spells them | | |
| 5. Your own constraint, with a test that fails without it | | |
| 6. `/stats` dashboard | | |
| 7. Your feature (write which option: A, B, C, or D) | | |
| All tests pass (`npm test`) | | |
| Lint and typecheck pass (`npm run lint`, `npm run typecheck`) | | |

### Understanding Self-Check

Answer briefly (1–3 sentences each):

1. **What do you feel you genuinely understand** about this assignment? (Not just "made it work," but could explain to someone else or extend on your own.)

2. **What did you make work without fully understanding?** (Be honest. This is useful self-knowledge.)

3. **Where did you get stuck?** What did you try before moving on or seeking help?

---

## Part 1: Short Response (1–2 paragraphs each)

### A: Following the Failures

In Task 0 you looked around before fixing anything. After that, the handout pointed you to each failure in turn and named the layer it lived in. Choose the failure that showed up farthest from where it started, and trace its path: where the mistake was, what it handed to the next layer, and where you finally saw something go wrong. It may help to consider what you noticed (or missed) during Task 0, and how you would have found the right layer if the handout hadn't named it.

Task 2's issue showed up furthest from the point of failure. The problem was in the constraint `prerequisiteOrder` which used `le()` instead of `lt()`. The erroneous constraint then got passed into the solver, which solved based on it, propogating the error into the tests and into the display. I initially saw the issue in the failing tests. I had looked through the failing tests before doing my task 0 walkthrough so I kept an eye out for places where the failing tests might be going wrong. This led me to read the prereq constraint carefully and notice that it was using le rather than lt. You can see in my [notes.md](notes.md) that I noticed this error in my initial walkthrough. Since I already had a theory of what was wrong, the task naming the location of the issue didn't help me much. In fact, for tasks 2 and 3 I already had a theory of where the issue was and for task 1, I didn't really know what "\[t]he TypeScript that carries data between the other layers" really meant so none of the location info was actually especially useful to me.

Be honest about what you actually did, not what you think you *should* have done.



### B: What You Didn't Write

A lot of what ran in this assignment was never written by you. The solver chose the semesters, the database worked out how to carry out each query, and the template engine turned your data into HTML. If you used an LLM, whatever it wrote for you belongs on that list too, so say briefly what you used it for. Which of these did you rely on most, and why did you trust it (or not)? Then name one thing you did write yourself and wish you hadn't had to.

---

## Part 2: The Catalog and Our Database

Our `prerequisites` table can only say one thing: "this course requires *all* of these courses." The real [Brandeis course catalog](https://www.brandeis.edu/registrar/bulletin/provisional/courses/subjects/4700.html) says much more. Here is how the catalog describes two of the courses in our seed data:

- **MATH 39a** (Introduction to Combinatorics): "Prerequisite: COSI 29a or MATH 23b, or permission of the instructor."
- **MATH 15a** (Linear Algebra): "Prerequisites: MATH 5a and permission of the instructor, placement by examination, or any mathematics course numbered 10 or above."

To fit our schema, we kept one option from each and dropped the rest.

### A: A Plan for "Or" (1–2 paragraphs, no code)

Outline a plan, in words rather than code, for supporting prerequisites with alternatives, such as "COSI 29a or MATH 23b." A good plan walks through each part of the system that would change (how the rule is stored, how it reaches the solver, how it is stated as a constraint, and how it is shown on the pages) and names what already depends on the current structure and would need to keep working (think back to the contracts from HW1). It doesn't need to cover every kind of rule in the catalog, as long as it says which ones it handles and which it leaves out.

### B: Asking the Catalog (1–2 paragraphs)

Suppose an incoming undergraduate asks you: what is the earliest semester I could take COSI 106b? Our solver already has an answer. In Task 5, you saw that it finds no plan with COSI 106b in semester 3 or earlier, so its answer is semester 4.

Now answer the same question from the catalog itself, starting from the [Computer Science](https://www.brandeis.edu/registrar/bulletin/provisional/courses/subjects/1400.html) page of the Bulletin. Choose one way to do this:

- **By hand:** read the catalog entries yourself and work out the answer.
- **With an LLM:** give it the catalog text and ask it the question. Include the parts of its reply that you discuss.

Compare the two answers, and explain when you would trust each. It may help to consider what the solver's answer actually guarantees, and whether either answer depends on something our schema can't say. If the two answers agree, that is worth writing about too.

### C: What a Language Lets You Say (2–3 paragraphs)

The catalog, our schema, and the language you chose for Task 7 are all ways of writing down rules. The catalog's English can say almost anything, including "permission of the instructor," but a program can't check any of it. Our schema can say much less, and everything it does say can be queried, checked, and handed to a solver. In class we discussed McLuhan's claim that every medium carries a message of its own, apart from the content of whatever is sent through it.

Start from your Task 7 feature. The tests only checked its result, so the language was your choice. What did that language let you say easily, and what did it make awkward or rule out entirely? Then carry the same question back to the catalog. If the registrar ran a planner like ours for every student, could it keep some rules as tables and leave others in words for people to interpret, or would it be forced to choose one world? It may help to consider where that line would fall, and who would end up doing the interpreting. (If you chose Option D, start from the comment at the top of your file.)

---

## Part 3: Essay on Liberation and Dependency (500–700 words)

*This is the biggest question, in terms of both size and importance. Take your time with it.*

Backus argues that conventional programming languages keep programmers thinking one small step at a time, specifying *how* a computation proceeds rather than *what* it should produce, and he treats this as an intellectual limitation, not just a hardware one. Illich argues that a tool can grow past the point where it serves the people who use it, and start making decisions they can no longer inspect, understand, or override. Look back at how each of them makes his case.

Both are describing something real about working with SQL, a constraint solver, and a template engine. Backus's liberation and Illich's dependency may be two sides of the same coin: the same feature that frees you from writing a scheduling algorithm also means you cannot look inside the solver and ask why it chose *this* plan over another.

Write an essay that engages with **both** readings, using your own experience in this assignment as evidence. Your essay should take a position, not just describe both arguments neutrally.

**Possible directions** (choose 2–3 to develop; you do not need to touch all of them):

- **Where the readings hold and where they break**: Backus was writing about programming languages in 1977; Illich was writing about institutions like medicine, schooling, and transportation in 1973. What their arguments illuminate about a modern constraint solver, and where the analogies break down.
- **Your experience of liberation**: a moment where describing *what* you wanted (a query, a constraint, a template) genuinely freed you to think at a higher level than writing out *how* to get it.
- **Your experience of opacity**: a moment where a tool's behavior felt unpredictable or beyond your control, such as the solver picking one plan out of many or refusing a rule without saying why, and whether you ever felt you had delegated too much.
- **Debugging without a trace**: when the plan was wrong, you couldn't step through the solver or the database line by line; you had to reason about which layer was at fault. How that differs from debugging step-by-step code, and whether the difference is a form of liberation or of dependency.

A thoughtful defense of step-by-step, imperative programming is **entirely acceptable** if it is well reasoned and grounded in your experience.

---

## Submission

The written reflection is submitted separately from your artifact:

1. Write your responses in this document (or a copy of it, in any editor you like).
2. Upload the completed `WRITTEN.md` to the **HW2 Written** assignment on Gradescope.

### Formatting Guidelines

- **For all parts:** Aim for and prioritize clarity and honest engagement.
- **Part 1 and Parts 2A–2B**: ~1–2 paragraphs each
- **Part 2C**: ~2–3 paragraphs
- **Part 3**: **~500–700 words** (roughly one single-spaced page). It's fine to go slightly over.
