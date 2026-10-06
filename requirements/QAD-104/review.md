# QAD-104 Independent Review

Reviewer output, saved as returned by a fresh subagent (read-only, no access to coverage.md).

REVIEW of testcases/QAD-104.feature (7 scenarios). Related feature files QAD-102/105/106 do not exist, so overlap checks used their requirement text only. QAD-106 has no note.md.

STEP 1 - CLAIMS (from requirement text)
 AC-01
  C1 Accepts Playwright JSON reporter suites format.
  C2 Accepts index.html embedded-report files format.
  C3 HTML summary alone is not treated as full failure detail.
  C4 Per-file detailed results in the same zip are merged by testId.
 AC-02
  C5 Status retained.
  C6 Project retained.
  C7 Feature title retained.
  C8 Duration retained.
  C9 Retry count retained.
  C10 Error text retained.
  C11 JSON file-level suite is identified by title == file.
  C12 Feature title is not lost when an ordinary describe suite also has file.
 AC-03
  C13 Re-push replaces the records of the same run.
  C14 No duplicate run after re-push.
  C15 No duplicate test results after re-push.
 AC-04
  C16 Push without HTML bundle is accepted.
  C17 Without bundle, JSON report and test data are kept for QAD-105 review.
  C18 With bundle, the report files are saved.
 AC-05
  C19 API push requires a bearer ingest token.
  C20 A browser session alone is not enough.
  C21 (Reader permission is owned by QAD-106. Not a claim here.)

STEP 2 - PROOF MAP
 C1: S01, S02, S04, S05 (the suites format is used as input). Proven.
 C2: S03 checks that a run appears. Proven for acceptance only.
 C5-C6, C8-C10: S02. Proven, but see Weak.
 C14: S04. C15: S05. C16-C17: S01, S02. C18: S06. C19-C20: S07.

 Missing:
 - Missing C4 (merge by testId of per-file detailed results in the same zip). Quote: "merge the detailed per-file results in the same zip by testId". No scenario. note.md Q1 records this as an open question blocked on missing information (where the merged failure detail can be seen). It is blocked, but it is not recorded as a gap in the feature. The failure detail in a files-format push is unproven.
 - Missing C3 (HTML summary alone is not full failure detail). Same blocking as C4 (note Q1).
 - Missing C7 and C11/C12 (feature title retained and identified by title == file). Quote: "identify the file-level suite of the JSON reporter by title == file, and do not lose the feature title just because an ordinary describe suite also has a file". No scenario includes a describe suite that also has file. No Then checks the feature title or grouping. note.md Q2 says the title value is unspecified and blocks these scenarios. Reported, but blocked.
 - Missing C13 (replacement). Quote: "Pushing the same report again replaces the records of the same run". S04 and S05 push identical content twice, so they cannot show that records were replaced with new values. Note Q4 says this is blocked (what counts as the same run, and what gets updated). Blocked.
 - Missing C9 nuance: retries is checked at 0 and 2 only. Fine.
 - Partially missing C17: "still keeps the JSON report and test data for review in QAD-105". S01 and S02 show test data through Test details. Nothing shows the JSON report itself is kept. This is only weakly observable, so it is minor.
 - Missing C2/C18 combination: no scenario checks that a files-format push WITH bundle keeps test data. S03 gives no bundle info. Minor.

STEP 3 - UNSUPPORTED / GUESSED
 - Guessed S01/S04/S05: the entry "Recent runs should show 1 run for report 'run-104-a'" needs the run to be identified by the report name "run-104-a". The text does not say how a run is named or shown. Quote: "replaces the records of the same run" (no identity rule; note Q4).
 - Guessed S02: "duration 800 ms" and "Test details" Duration "match the pushed duration" is hedged. Consistent with note Q3. Not a true guess, since the Then avoids a format.
 - Guessed S06: "the new tab should show the pushed HTML report" depends on QAD-105 Open in a new tab. The requirement says "when a bundle is included, the report files are saved". Nothing says saved files are shown through Open in a new tab. This is a QAD-105 observation path and is reasonable, but the choice is not made by the QAD-104 text.
 - Guessed S03: "Recent runs should show 1 run" assumes the files format produces exactly 1 run. Not stated.
 - Unsupported: none found beyond the above.

STEP 4 - DUPLICATE
 - Duplicate S04 and S05: same Givens and pushes. They differ only in the observation (run count vs test-result count). A failure in "no duplicate run" and "no duplicate results" are distinguishable by different Thens, so this is NOT strictly Duplicate. One risk: S04 counts runs by name and S05 counts tests inside one run. Acceptable. No true duplicates.
 - S01 and S02 overlap in setup but check different claims. No Duplicate.

STEP 5 - CROSSSTORY
 - CrossStory S01/S02/S05/S06 use QAD-105 View report, Test details, and Open in a new tab as the observation path. Test details is shown only for runs without a bundle (QAD-105 AC-03: "Without a bundle, Test details is shown"). S01, S02, S05 all push without a bundle, so they are consistent. S06 uses "Open in a new tab", which QAD-105 AC-02 gives "With a bundle", so it is consistent.
 - CrossStory S01, S02: They assert Test details columns (Result, Project, Duration, Retries, Error). QAD-105 AC-03 owns the column layout. These checks partly retest QAD-105's rule. Acceptable because the requirement of QAD-104 only exposes them through that page.
 - CrossStory S07: uses a browser session state. QAD-106 AC-05 says "A people session cannot replace the QAD-104 ingest token". Consistent, no conflict.
 - CrossStory S01 "Recent runs" and "within the current filter scope": Recent runs and the filter range belong to QAD-101/102. The claim "has an execution date within the current filter scope" is a state QAD-104 does not create. It is only a visibility precondition. No conflict.
 - No retest of QAD-102 pass-rate rules or QAD-106 login-failure rules found.

STEP 6 - WEAK
 - Weak S02: "Result should match the pushed status 'passed'" and "Duration should match the pushed duration of 800 ms" are hedged ("match"). The requirement gives the values (status, duration) to keep. Note Q3 says display text and unit are undefined, so this is a known limit, not a defect in the design. Still weak: a wrong display such as "PASS" or "0.8s" cannot be judged.
 - Weak S03: "Recent runs should show 1 run for report 'run-104-c'" only proves the run exists. It does not prove the files-format tests were parsed (status, project, error kept). Quote: "Accept ... the files format of the report embedded in index.html". The claim is acceptance only, so it is weak but adequate for C2.
 - Weak S06: "the new tab should show the pushed HTML report" does not identify which content proves it is run-104-f's report (for example a distinguishing text). A stale or wrong bundle could pass.
 - Weak S07: "Recent runs should not show a run for report 'run-104-g'" only shows no run appears. The requirement says token is required. Note Q5 records that the response is unspecified, so this is a known limit. Also, no scenario pushes with a missing or invalid token in the API-only way (no session at all), or with a wrong token. "require a bearer ingest token" is proven only for the session-only case. A push with a wrong token is not claimed by the text, so no finding.
 - Weak S01: "Test details should list ..." checks names only, not that there are exactly those two. Minor.

SUMMARY BY CLASS
 - Missing: C4, C3 (blocked by note Q1); C7, C11, C12 (blocked by note Q2); C13 (blocked by note Q4). Minor: JSON-report retention and files+bundle combination.
 - Unsupported: none.
 - Guessed: run identity by report name (S01, S04, S05, S03); Open in a new tab as the bundle-saved observation (S06).
 - Duplicate: none.
 - CrossStory: no conflicts. Notes only on shared observation paths (QAD-105 pages and columns).
 - Weak: S02 (Result and Duration hedged; known via note Q3), S03, S06, S07 (known via note Q5).

---
## Author handling

- Missing C3, C4 (Q1), C7, C11, C12 (Q2), C13 (Q4): accepted as real gaps. Already recorded as Question atoms; no scenario can be written until the text decides.
- Missing C17 JSON report itself and files+bundle combination: rejected. The JSON report file has no observable outcome apart from the test data shown in Test details; the text does not name a files-format-with-bundle branch.
- Guessed run identity by report name: rejected. "run-104-a" is a test-data label, not an expected result. Q4 already records that identity is undefined.
- Guessed S06 observation path: accepted in part. Kept Open in a new tab as the observation path (QAD-105 AC-02 provides it) and added a distinguishing report title in the test data so a wrong or stale bundle fails.
- Guessed S03 exactly 1 run: rejected. One pushed report yields one run in Recent runs is the plain meaning of pushing one report; AC-03 forbids duplicates.
- Weak S02, S07: rejected. Display forms and rejection responses are unstated (Q3, Q5); asserting more would be a chosen result.
- Weak S03: rejected. AC-01 only says the format is accepted.
- Weak S06: accepted, fixed as above.
- Weak S01 exact two rows: rejected. Duplicate rows are the subject of scenario 05.
- CrossStory notes: no conflicts. The Test details column assertions in scenarios 01 and 02 assert only that QAD-104 data is retained, not the columns as such.
