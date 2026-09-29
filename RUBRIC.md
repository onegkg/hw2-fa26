# HW2 Grading Rubric

This assignment is evaluated using **two independent letter grades**, as described in the syllabus:

* **Artifact & Automation Grade:** evaluates your technical work and your engagement with the tools
* **Written Reflection Grade:** evaluates your theory-building, reflection, and engagement with course ideas

These two grades measure *different learning outcomes*. They are not averaged mechanically, and strong performance in one does not automatically imply strong performance in the other.

---

## Part A: Artifact & Automation Grade

This grade evaluates how you engaged with the technical work of debugging and extending the course planner across its languages: TypeScript, SQL, the solver's constraints, and HTML templates.

You are **not** graded solely on whether everything works. You *are* graded on whether your work shows good-faith effort, intentionality, and engagement with the system.

The Gradescope autograder checks your tests, lint, and typecheck, but its score is not your letter grade. Lint and typecheck earn no autograder points, and they still count here.

### Artifact Grade: A+ / A / A-

You will receive an A-range artifact grade if **most** of the following are true:

* The three failures are fixed and all original tests pass (Tasks 1–3), with each fix made in the layer where the mistake was, rather than worked around further down the pipeline
* Course titles appear the way the catalog spells them (Task 4), and you can explain why your fix works
* Your constraint states a real planning rule, and your test for it would fail if the constraint were removed (Task 5)
* The `/stats` dashboard presents its data clearly and is reachable from the navigation (Task 6)
* Your feature (Task 7) works, stays within the scope of the option you chose, and was written in a language you chose on purpose
* Lint and typecheck pass without suppressions, and no original test was changed, skipped, or deleted

This grade reflects **strong control over a system built from several languages**, even if minor gaps remain.

---

### Artifact Grade: B+ / B / B-

You will receive a B-range artifact grade if:

* Most failures are fixed, but at least one fix works around the problem instead of fixing it where it started
* Your constraint is present, but its test is weak or would pass without it
* The dashboard or your feature is incomplete or only partly working
* Some lint or type errors remain, but the tools were not bypassed

This grade reflects **substantial progress**, but with clear room for improvement.

---

### Artifact Grade: C+ / C

You will receive a C-range artifact grade if:

* There is clear evidence of effort and engagement with the assignment
* Some failures are fixed, and there is evidence that you traced the others to the right layer, even if you did not resolve them
* Few of the later tasks (4–7) were completed
* Lint and typecheck may largely fail, but were not ignored or bypassed

This grade reflects a **good-faith attempt** that did not fully succeed technically.

---

### Artifact Grade: D / E

You will receive a D or E if:

* There is little evidence of engagement with the technical work
* Tests, lint, or typecheck were bypassed, disabled, or removed
* Minimal or superficial changes were made
* The submission does not reflect a serious attempt to complete the assignment

---

## Part B: Written Reflection Grade

This grade evaluates the quality of your reflection, theory-building, and engagement with course readings and ideas.

The written component is not a summary or justification. It is an opportunity to demonstrate *how you understand what you worked on*, including confusion, failure, or disagreement.

---

### Reflection Grade: A+ / A / A-

You will receive an A-range reflection grade if:

* Your writing is specific, honest, and grounded in your actual experience
* You trace a failure from where it showed up back to where it started, and explain what passed it from one layer to the next (Part 1)
* You reason carefully about what a language or schema can and cannot say: your plan for "or" accounts for what depends on the current structure, and you compare the solver's answer with the catalog's by what each one actually guarantees (Part 2)
* You use your own Task 7 feature as evidence for how a language shapes what you can express (Part 2)
* Your essay engages analytically with **both** Backus and Illich, takes a clear position, and grounds it in your experience (Part 3)
* Frameworks from other course readings are used analytically, not just mentioned
* If you used AI tools, you critically examine their role and limitations

This grade reflects **strong theory-building** or a well-defended critique of its necessity.

---

### Reflection Grade: B+ / B / B-

You will receive a B-range reflection grade if:

* Your reflection is thoughtful and accurate, but limited in depth or synthesis
* Your essay addresses the prompt, but engages one reading much more than the other, or describes both without taking a position
* Examples from your work are present but underdeveloped

This grade reflects **solid understanding**, with room to go deeper.

---

### Reflection Grade: C+ / C

You will receive a C-range reflection grade if:

* Your reflection is honest but vague or shallow
* You acknowledge confusion or partial understanding without fully unpacking it
* The readings are referenced only in passing, or the essay answers a different question than the one asked
* Some sections are missing

This grade reflects **partial theory-building** and awareness of learning gaps.

---

### Reflection Grade: D / E

You will receive a D or E if:

* The reflection is generic, boilerplate, or disconnected from the assignment
* There is little evidence of genuine engagement or understanding
* AI use (if any) is hidden or uncritically accepted

---

## How to Interpret the Two Grades

You will receive **two separate letter grades** for HW2: one for the artifact and one for the written reflection.

Examples:

* **Artifact: C+, Reflection: A** → strong understanding despite incomplete execution
* **Artifact: A-, Reflection: C** → working code but shallow engagement
* **Artifact: B, Reflection: B+** → solid performance across both dimensions

Both grades matter. A strong written reflection can partially offset incomplete technical execution, though both are expected to show meaningful effort by this point in the semester.

---

## Final Note

The goal of this assignment is to understand what it means to describe a problem in a language built for it: what that language lets you say, what the tool behind it works out for you, and what remains your responsibility as the programmer.

---

## Notes

* Accurate self-assessment (Part 0) demonstrates the kind of self-awareness we value and is taken into account when calibrating grades at the margins.
* In Part 2B, answering from the catalog by hand and answering with an LLM are graded the same way.
* Students may be selected for an **oral exam** to discuss their artifact and reflection.
