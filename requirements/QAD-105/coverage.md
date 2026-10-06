# QAD-105 Coverage Trace

## Related Stories

| Story | Relation | Handling |
|---|---|---|
| QAD-104 | Prerequisite | Read the requirement and QAD-104 note.md, and also QAD-104.feature. QAD-104 owns pushing, kept fields, and repeated pushes. This Story uses pushed runs as Given, and asserts neither that fields are kept nor that nothing is duplicated. AC-04 says report content and error messages come from QAD-104, so that atom is Owned elsewhere. QAD-104 scenario 06 asserts that the bundle is saved through Open in a new tab, and scenario 02 of this Story asserts the embedded view; the two observe different things. QAD-104 Q2 is open (the value of the feature title), so scenario 05 does not assert group titles. |
| QAD-106 | Shared rule | Read the requirement. QAD-106 owns the people session and the access rules for run details. This Story only uses a signed-in person in Given and does not test signed-out access. The access atom in AC-04 is Owned elsewhere. |

## Atoms

| Atom | Source | Quote | Disposition | Ref |
|---|---|---|---|---|
| A01 | AC-01 | A signed-in person clicks View report in Recent runs | Covered | |
| A02 | AC-01 | which opens the details of the selected run | Covered | |
| A03 | AC-01 | it shows that run's basic information | Question | Q2 |
| A04 | AC-01 | status counts | Covered | |
| A05 | AC-01 | does not open another run | Covered | |
| A06 | AC-02 | With a bundle, the saved original HTML report is embedded | Covered | |
| A07 | AC-02 | Open in a new tab is offered | Covered | |
| A08 | AC-02 | Uploaded report assets are kept | Covered | |
| A09 | AC-02 | no trace, screenshot, or video that the original report did not contain is promised | Not testable | Limiting clause with no observable result |
| A10 | AC-03 | Without a bundle, Test details is shown | Covered | |
| A11 | AC-03 | grouped by feature | Covered | |
| A12 | AC-03 | listing Test, Project, Result, Duration, Retries, and Error | Covered | |
| A13 | AC-03 | it states clearly that this run did not upload an HTML bundle | Covered | |
| A14 | AC-03 | A row with no error message shows — | Covered | |
| A15 | AC-04 | The JSON fallback does not show made-up entry points for traces, screenshots, or videos | Covered | |
| A16 | AC-04 | Report content and error messages come from QAD-104 | Owned elsewhere | QAD-104 |
| A17 | AC-04 | access requires a QAD-106 people session | Owned elsewhere | QAD-106 |

## Assertions

| Then | Atom | Type | Basis |
|---|---|---|---|
| 01.1 | A04 | Derived | Status counts follow the four categories of QAD-102 AC-01; run-105-x has 3 passed, 1 failed, 1 flaky, and 2 skipped tests, so it shows 3, 1, 1, 2. |
| 01.2 | A01 | Stated | |
| 01.2 | A02 | Stated | |
| 01.3 | A05 | Derived | run-105-x is opened, so a test that belongs only to run-105-y must not appear. |
| 02.1 | A06 | Stated | |
| 02.2 | A07 | Stated | |
| 03.1 | A08 | Derived | The bundle includes that screenshot and the rule keeps uploaded report assets, so the screenshot can be opened in the embedded report. |
| 04.1 | A10 | Stated | |
| 04.2 | A12 | Stated | |
| 04.3 | A13 | Stated | |
| 05.1 | A11 | Derived | The rule groups by feature; two tests belong to one feature and one to another, so there are two groups. |
| 06.1 | A14 | Stated | |
| 07.1 | A15 | Stated | |
