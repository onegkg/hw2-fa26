# Task 0

### `schema.sql`

- 3 tables,
    - 1 for courses, 1 for prereqs, 1 for plan
    - there are 4 semesters
    - what happens if a course has itself as a prereq

### `seed.sql`
- not much of note

### `queries.ts`
- pretty standard
    - interfaces match the sql schema, queries makke sense to me

### `solver/types.ts` and `solver/constraints.ts`
- `s` constants are the semester (?)
- `prerequisitieOrder` should have less than not le
- I think in `maxCoursesPerSemester` and `semesterCreditLimit`, it should be getting `c.semester` instead of `c.id`

### `solver/pipeline.ts`
- the `prereqs` query only captures intradepartmental prereqs for some reason
- the value of the map on line 49 (`semVars` looks wrong, but I don't know enough about Z3 to tell if it actually is. But like why are we initializing an integer constant with a string?
- Don't really understand what's going on on lines 58-63

### `web/routes.ts`
- Am too lazy to look at frontend stuff rn, will come back to when necessary

### `tests/invariants.test.ts`
- All makes sense, already read the test outputs so it's not new stuff

### Web View
- first semester has both math 10 and math 15 
- Semester two has cosi103 which needs 12b but no 12b in past and 130 and 29 are treated as coreqs instead of 29 as prereq
- Third semester has has 127 without 21 in past

### test output
- Semesters in valid ranges (didn't see in web view, but makes sense since web view might not be able to display?)
- no course shares semester with prereq (saw)
- every prereq is respected (saw)
- Did not see the issues that `course names` seeks to prevent, but i'm not intimately familiar with way the catalog spells it so...
- i don't even know that `/stats` was a thing, ig because it isn't linked in the nav bar lol
- idk what this `studentConstraint` thing is, ig a later task?

# Task 1
- cosi106 has semester 0
- Doesn't appear in web view which makes sense
- I think was just that there was a conversion to 0 indexed on deserialization to ts code
