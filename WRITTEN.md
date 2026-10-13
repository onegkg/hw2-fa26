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
| 4. Course titles appear the way the catalog spells them | done | |
| 5. Your own constraint, with a test that fails without it | done | |
| 6. `/stats` dashboard | done | |
| 7. Your feature (write which option: A, B, C, or D) | done | Option C |
| All tests pass (`npm test`) | done | |
| Lint and typecheck pass (`npm run lint`, `npm run typecheck`) | done | |

### Understanding Self-Check

Answer briefly (1–3 sentences each):

1. **What do you feel you genuinely understand** about this assignment? (Not just "made it work," but could explain to someone else or extend on your own.)
- The semantics of the syntax of the subset of Z3 used in this project (like couldn't write it from scratch but understand what it's doing and could write similar code with just the Z3 docs)
- How TypeScript ties together Z3, SQL, and Express to create a final project.
- How SQL is used in the project


2. **What did you make work without fully understanding?** (Be honest. This is useful self-knowledge.)
- All of the embedded js stuff. I'm not really a frontend person, used AI to help with part 6 and intentionally chose not to touch ejs in part 7, but I understand the general concepts of templating languages and how they're used in the project.

3. **Where did you get stuck?** What did you try before moving on or seeking help?
- I got stuck for a bit on the first task since I thought I had a solution, but it didn't seem to be working. I ended up tracing through the code from the point of failure in the test up through the whole pipeline and even into the SQL and Z3 portions and couldn't find any other solution. Eventually I tried the first solution again and it worked, so I think it might have been a situation where my changes didn't propogate into the docker container.

---

## Part 1: Short Response (1–2 paragraphs each)

### A: Following the Failures

In Task 0 you looked around before fixing anything. After that, the handout pointed you to each failure in turn and named the layer it lived in. Choose the failure that showed up farthest from where it started, and trace its path: where the mistake was, what it handed to the next layer, and where you finally saw something go wrong. It may help to consider what you noticed (or missed) during Task 0, and how you would have found the right layer if the handout hadn't named it.

Task 2's issue showed up furthest from the point of failure. The problem was in the constraint `prerequisiteOrder` which used `le()` instead of `lt()`. The erroneous constraint then got passed into the solver, which solved based on it, propogating the error into the tests and into the display. I initially saw the issue in the failing tests. I had looked through the failing tests before doing my task 0 walkthrough so I kept an eye out for places where the failing tests might be going wrong. This led me to read the prereq constraint carefully and notice that it was using le rather than lt. You can see in my [notes.md](notes.md) that I noticed this error in my initial walkthrough. Since I already had a theory of what was wrong, the task naming the location of the issue didn't help me much. In fact, for tasks 2 and 3 I already had a theory of where the issue was and for task 1, I didn't really know what "\[t]he TypeScript that carries data between the other layers" really meant so none of the location info was actually especially useful to me.

Be honest about what you actually did, not what you think you *should* have done.

### B: What You Didn't Write

A lot of what ran in this assignment was never written by you. The solver chose the semesters, the database worked out how to carry out each query, and the template engine turned your data into HTML. If you used an LLM, whatever it wrote for you belongs on that list too, so say briefly what you used it for. Which of these did you rely on most, and why did you trust it (or not)? Then name one thing you did write yourself and wish you hadn't had to.

I used an LLM for task 6 as I do not enjoy and am not good at writing frontend code. I pointed the LLM at the ARTIFACT.md and instructed it to complete task 6. After it proposed changes, I read through them, checked the page in the browser, and ran the tests to make sure that the changes were sensible and compliant.

I suppose the automation that I relied on most would be the TypeScript SQLite driver used in this project since every part of the project touches the data and the SQLite driver handles the data retrieval and storage. Honestly I trust it for mostly the same reasons anyone trusts any npm package: it claims to do the thing and we haven't observed it not doing that thing or heard of others observing it not doing that thing. I'm not sure this is a good reason to trust a piece of software, but it is good enough for most of the web dev ecosystem so therefor it is good enough for me in a school project.

Honestly, there wasn't really anything that I wrote myself that I wished I didn't have to. The one thing I didn't really want to write, I offloaded to an LLM (with reasonable safeguards), and the rest of the assignment I enjoyed doing by hand.

---

## Part 2: The Catalog and Our Database

Our `prerequisites` table can only say one thing: "this course requires *all* of these courses." The real [Brandeis course catalog](https://www.brandeis.edu/registrar/bulletin/provisional/courses/subjects/4700.html) says much more. Here is how the catalog describes two of the courses in our seed data:

- **MATH 39a** (Introduction to Combinatorics): "Prerequisite: COSI 29a or MATH 23b, or permission of the instructor."
- **MATH 15a** (Linear Algebra): "Prerequisites: MATH 5a and permission of the instructor, placement by examination, or any mathematics course numbered 10 or above."

To fit our schema, we kept one option from each and dropped the rest.

### A: A Plan for "Or" (1–2 paragraphs, no code)

Outline a plan, in words rather than code, for supporting prerequisites with alternatives, such as "COSI 29a or MATH 23b." A good plan walks through each part of the system that would change (how the rule is stored, how it reaches the solver, how it is stated as a constraint, and how it is shown on the pages) and names what already depends on the current structure and would need to keep working (think back to the contracts from HW1). It doesn't need to cover every kind of rule in the catalog, as long as it says which ones it handles and which it leaves out.

The first place to start is with the database. I would start by adding an `INTEGER` column named `position` to the `prerequisites` table. Each prerequisite would have a position value, and only one prerequisite per position would be required to enroll in a course. In order to model the COSI 29a or MATH 23b example, your prereqs table would look something like this (excuse the pseudo-json):

```
[
    {
        course_id: "Example",
        prereq_id: "COSI29a",
        position: 0,
    },
    {
        course_id: "Example",
        prereq_id: "MATH23b",
        position: 0,
    },
    // if you wanted to add another prereq with no alternatives
    // {
    //      course_id: "Example",
    //      prereq_id: "MATH10a",
    //      position: 1,
    // }
]
```

This schema change would have to be propogated throughout the retrieval process and into the TS storage.

The other most interesting change is to the solver. The `prerequisiteOrder` constraint would need to be replaced with a more flexible constraint. One way I can think to implement this constraint would be to for each course, create a list of lists where each index `i` contains the prereqs for that course where `i === position`. Then if each list in the list of lists has at least one element which satisfies `prerequisiteOrder`, that course is valid.

This solution works for all rules, as long as the prerequisite can also be represented as a course in the solver. This does however come at the cost of complexity. The db storage is not the most intuitive system, and the solver is much more complex than the old version. More elegant approaches could be easily created to cover a less complete subset of the rule-space.

### B: Asking the Catalog (1–2 paragraphs)

Suppose an incoming undergraduate asks you: what is the earliest semester I could take COSI 106b? Our solver already has an answer. In Task 5, you saw that it finds no plan with COSI 106b in semester 3 or earlier, so its answer is semester 4.

Now answer the same question from the catalog itself, starting from the [Computer Science](https://www.brandeis.edu/registrar/bulletin/provisional/courses/subjects/1400.html) page of the Bulletin. Choose one way to do this:


- **By hand:** read the catalog entries yourself and work out the answer.
- **With an LLM:** give it the catalog text and ask it the question. Include the parts of its reply that you discuss.

**By hand:**
For grad students: Semester 2 (use the exam to pass out of 10, then take 12 and 21 concurrently first semester, then take 106 second)
For undergrads: Semester 3 (use the exam to pass out of 10, take 12 first semester, 21 second semester, and 106 third semester)


Compare the two answers, and explain when you would trust each. It may help to consider what the solver's answer actually guarantees, and whether either answer depends on something our schema can't say. If the two answers agree, that is worth writing about too.

In this case, I would trust the hand-rolled answer more than the solver's answer, not due to any inherent limitation of the solver, but rather due to the limitation of the model it was solving against. If I had hand-rolled an answer against the same model as the solver I would have also concluded that semester 4 was the earliest you could take 106. The solver's answer is only as strong as the model it's solving against. If the model doesn't accurately reflect the domain, then the solver is not going to be able to give an accurate answer.

### C: What a Language Lets You Say (2–3 paragraphs)

The catalog, our schema, and the language you chose for Task 7 are all ways of writing down rules. The catalog's English can say almost anything, including "permission of the instructor," but a program can't check any of it. Our schema can say much less, and everything it does say can be queried, checked, and handed to a solver. In class we discussed McLuhan's claim that every medium carries a message of its own, apart from the content of whatever is sent through it.

Start from your Task 7 feature. The tests only checked its result, so the language was your choice. What did that language let you say easily, and what did it make awkward or rule out entirely? Then carry the same question back to the catalog. If the registrar ran a planner like ours for every student, could it keep some rules as tables and leave others in words for people to interpret, or would it be forced to choose one world? It may help to consider where that line would fall, and who would end up doing the interpreting. (If you chose Option D, start from the comment at the top of your file.)

For task 7, I chose to implement searching in TypeScript. While I initially planned to implement the feature in SQL, I switched to TypeScript when I realized that I would need to filter using the `LIKE` command, which I can never remember how to use. My language choice was primarily representative of my familiarity with each language rather than what they allow or disallow. With that being said, the two languages have very different intended use cases, and as such, their feature-set tends to be geared towards those use cases, it just happens that the feature I was implementing lives at the intersection of their domains. Filtering data is just about as easy in typescript as it is in SQL, but if I had another task, the language choice could have a huge impact on the feasibility of the feature.

If the registrar wanted to run a planner like this using the actual class catalog, they would not be able to leave some rules as text, but would either have to operationalize those rules in a way the solver could understand, or would have to remove them.

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


In his Turing Award lecture *Can Programming Be Liberated from the von Neumann Style? A Functional Style and Its Algebra of Programs*, Backus argues that modern (for 1978) imperative (or von Neumann) programming languages carry the bottleneck of the von Neumann architecture to a higher level of abstraction than necessary. He proposes a functional style of programming which liberates the user from the tyranny of word-by-word programming. In *Two Watersheds*, Illich seems to provide a counterargument to Backus. He argues that we have become dependant on the innovation of medicine noting that, antibiotic resistant bacteria, for example, would not exist without the widespread proliferation of western medicine.

While the two seem to be offering contradictory perspectives, in truth they are advocating for roughly the same thing, but are just focusing on different aspects. They both recognize the limitations and bloat built into a dominant paradigm (that we are dependent on), and see the only escape (or liberation) as an entirely new paradigm (functional programming or deprofessionalization). Backus just emphasizes the upsides of the new paradigm while Illich emphasizes the downsides of the old paradigm.

With that being said, the concepts of dependence and liberation are certainly relevant to our conversations about automation. I've certainly felt that moment of liberation when learning functional languages (these moments are not limited to functional languages, but are instead applicable whenever you move up an abstraction layer, I just chose FP, because it is the most recent of my liberatory moments): the first time functional-style filter, map, and reduce clicked for me and my first time seeing an ocaml program which contains no type annotations, but is still 100% strongly typed at compile time are two recent moments that stand out to me. But FP languages can also be rather restrictive. Sometimes the simplest way of doing something really is mutating a variable, sometimes a for loop really is useful, and sometimes you would like to not have to perform 10 different O(n) operations in order to filter a list in the specific way you want. Similarly, while building out my search filtering in task 7, I chose TypeScript instead of SQL due to my familiarity with TypeScript and my lack of familiarity with SQL's string matching. But I ended up having to write some pretty ugly code to make this work, while the comparable SQL query would have almost certainly been not just more elegant, but also more performant. This speaks to a big reason why these paradigm shifts happen only rarely in practice: Momentum. No matter how much better a new paradigm than the status quo, if the cost (whether monetary or temporal) to transition is too high, it will never truly pick up steam. We are still using imperative languages and professional doctors not because they are better than the alternatives, but because a switch to a new system would be impractical at any given moment.

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
