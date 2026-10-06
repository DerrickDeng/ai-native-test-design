# QAD-104 Coverage Trace

## Related Stories

| Story | Relation | Handling |
|---|---|---|
| QAD-102 | Shared rule | Read the QAD-102 requirement (its feature file did not exist yet during this run, so it was not read). QAD-102 owns the passed, failed, flaky, and skipped counts, the pass-rate definition, and the per-row pass rate in Recent runs. This Story only asserts that test status and retry count are kept, and asserts no count or pass rate. |
| QAD-105 | Prerequisite | Read the QAD-105 requirement and note.md. QAD-105 owns the run details, the Test details columns, grouping, and the — display. This Story uses View report and Test details as the place to observe the kept data, and only asserts whether the data pushed by QAD-104 is kept and whether it is duplicated. QAD-105 note Q1 says there is no real HTML bundle evidence, so the tester must prepare the bundle data for scenario 06. |
| QAD-106 | Shared rule | Read the QAD-106 requirement. QAD-106 owns people read access and people sign-in. This Story only uses a signed-in person in Given and asserts the ingest token rule. QAD-106 AC-05 also says a session cannot replace the ingest token; this Story's AC-05 is the owner, and QAD-106 does not retest it. |

## Atoms

| Atom | Source | Quote | Disposition | Ref |
|---|---|---|---|---|
| A01 | AC-01 | Accept the suites format of the Playwright JSON reporter | Covered | |
| A02 | AC-01 | and the files format of the report embedded in index.html | Covered | |
| A03 | AC-01 | Do not treat the HTML summary alone as complete failure details | Question | Q1 |
| A04 | AC-01 | merge the detailed per-file results in the same zip by testId | Question | Q1 |
| A05 | AC-02 | Keep status | Covered | |
| A06 | AC-02 | , project, | Covered | |
| A07 | AC-02 | , feature title, | Question | Q2 |
| A08 | AC-02 | , duration, | Covered | |
| A09 | AC-02 | , retry count, | Covered | |
| A10 | AC-02 | error message from the test results | Covered | |
| A11 | AC-02 | identify the file-level suite of the JSON reporter by title == file | Question | Q2 |
| A12 | AC-02 | do not lose the feature title just because an ordinary describe suite also has a file | Question | Q2 |
| A13 | AC-03 | Pushing the same report again replaces the records of the same run | Question | Q4 |
| A14 | AC-03 | must not add a duplicate run | Covered | |
| A15 | AC-03 | duplicate test results | Covered | |
| A16 | AC-04 | A push may omit the HTML bundle | Covered | |
| A17 | AC-04 | still keeps the JSON report and test data for review in QAD-105 | Covered | |
| A18 | AC-04 | when a bundle is included, the report files are saved | Covered | |
| A19 | AC-05 | API pushes require a bearer ingest token | Covered | |
| A20 | AC-05 | a browser session alone is not enough | Covered | |
| A21 | AC-05 | Read access for people is managed by QAD-106 | Owned elsewhere | QAD-106 |

## Assertions

| Then | Atom | Type | Basis |
|---|---|---|---|
| 01.1 | A01 | Stated | |
| 01.1 | A16 | Stated | |
| 01.2 | A17 | Stated | |
| 02.1 | A05 | Stated | |
| 02.2 | A06 | Stated | |
| 02.3 | A08 | Stated | |
| 02.4 | A09 | Stated | |
| 02.5 | A10 | Stated | |
| 03.1 | A02 | Stated | |
| 04.1 | A14 | Derived | The same report is pushed twice, and the rule forbids a duplicate run, so the report has 1 run. |
| 05.1 | A15 | Derived | The same report has 2 tests and is pushed twice; the rule forbids duplicate test results, so each test appears once. |
| 06.1 | A18 | Derived | The rule says the report files are saved when a bundle is included, so opening the saved report from that run shows the pushed report. |
| 07.1 | A19 | Derived | The rule says API pushes require a bearer ingest token; without it the push is not accepted, so no run is created. |
| 07.1 | A20 | Derived | The tester holds a valid browser session but no token; the rule says a session is not enough, so no run is created. |
