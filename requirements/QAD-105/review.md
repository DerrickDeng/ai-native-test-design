# QAD-105 Independent Review

Reviewer output, saved as returned by a fresh subagent (read-only, no access to coverage.md).

# Review of testcases/QAD-105.feature

Files read: the QAD-105 requirement and note.md, the QAD-104 and QAD-106 requirements, QAD-104 note.md, QAD-105.feature and QAD-104.feature. These files do not exist: QAD-106/note.md and testcases/QAD-106.feature. I did not read any coverage.md or review.md.

## Step 1: Claims and proof

| # | Claim (quote) | Proof | Result |
|---|---|---|---|
| C1 | "A signed-in person clicks View report in Recent runs, which opens the details of the selected run" | Sc01 | Proven |
| C2 | "it shows that run's basic information" | none | Missing (blocked by note Q2) |
| C3 | "it shows that run's ... status counts" | Sc01 | Proven, four categories chosen (note Q3) |
| C4 | "does not open another run" | Sc01 third Then | Proven, but weak (see Weak 2) |
| C5 | "With a bundle, the saved original HTML report is embedded" | Sc02 | Proven |
| C6 | "Open in a new tab is offered" | Sc02 | Proven, but the link's behavior is not checked (see Weak 3) |
| C7 | "Uploaded report assets are kept" | Sc03 | Proven |
| C8 | "no trace, screenshot, or video that the original report did not contain is promised" | none | Missing, low value. It is a non-promise, and the bundle case is not covered by Sc07. See Missing 1. |
| C9 | "Without a bundle, Test details is shown" | Sc04 | Proven |
| C10 | "grouped by feature" | Sc05 | Proven; group titles are excluded (note Q4) |
| C11 | "listing Test, Project, Result, Duration, Retries, and Error" | Sc04 checks the column headers only | Partly missing (see Missing 2) |
| C12 | "it states clearly that this run did not upload an HTML bundle" | Sc04 | Proven; the exact text is not asserted (note Q3) |
| C13 | "A row with no error message shows —" | Sc06 | Proven |
| C14 | "The JSON fallback does not show made-up entry points for traces, screenshots, or videos" | Sc07 | Proven |
| C15 | "Report content and error messages come from QAD-104" | not applicable | Owned by QAD-104 |
| C16 | "access requires a QAD-106 people session" | not applicable | Owned by QAD-106 |

## Findings

**Missing**

1. Sc02/Sc03 (bundle mode) have no `Then` that no trace, screenshot or video entry exists beyond what the bundle uploaded. Quote: "no trace, screenshot, or video that the original report did not contain is promised". Why it matters: this is a negative claim, but it is not covered when a bundle exists. It is low priority because the claim is only a non-promise.
2. Quote: "listing Test, Project, Result, Duration, Retries, and Error". Sc04 checks only that the six column headers exist. No scenario in this feature checks that row cells show the values, for example the Project or Retries value. QAD-104 Sc02 checks those cell values. That is a QAD-104 rule (preserving data), so this is only a gap for the "list" claim in QAD-105 AC-03. It is borderline, and QAD-104 Sc02 probably covers it.
3. Quote: "it shows that run's basic information". There is no scenario. It is blocked by open question Q2 (the field list is missing), so I report it and note it is blocked.

**Unsupported**

None. Every `Then` traces to AC text. Two are choices, listed under Guessed.

**Guessed**

1. Sc01: "passed 3, failed 1, flaky 1, skipped 2". The requirement says only "status counts". The four categories are borrowed from QAD-102 AC-01, and the note records this as Q3. The exact display is a guess. There is also no assertion of total or of the counts for run-105-y.
2. Sc06: `Error should show "—"`. The character is given in the AC ("shows —"), so this is supported. I am not reporting it as a finding.
3. Sc04 `Then` "six columns" and Sc05 grouping are supported by the AC. The Sc05 setup ("belong to one feature") depends on how QAD-104 defines a feature (QAD-104 note Q2, open). This is a related-Story dependency and is not a Guess in itself.

**Duplicate**

Sc06 and Sc07 both use a JSON fallback (no-bundle) run, but they assert different things, so a failure in one would not hide a failure in the other. Sc04's assertions (Test details, headers, no-bundle text) are also separate. No duplicates, with one weak note. Sc04 and Sc05 both click View report on a no-bundle run and could share one scenario, but their expected results differ, so I do not report them.

**CrossStory**

1. Sc03, `When QA opens the screenshot of test "user can sign out" in the embedded report` and `Then the uploaded screenshot should be shown`. The bundle's contents and the state of the embedded report are QAD-104 concerns (AC-04 "when a bundle is included, the report files are saved"). QAD-104 Sc06 already proves the bundle is saved and shown in a new tab. Sc03 adds the "resource preserved" claim, which is a QAD-105 AC-02 claim, so it is legitimate. Risk: Sc03 needs a bundle with a screenshot, but note Q1 says the mock data has no real bundle, trace, screenshot or video. The state is not currently creatable. Quote: "This simulation only provides JSON reporter data, with no real Playwright HTML bundle, trace, screenshot, or video". Why it matters: Sc03 cannot be executed until evidence exists.
2. Sc02 overlaps QAD-104 Sc06. Both push a bundle whose index.html has a title and check the embedded or opened report shows that title. QAD-104 Sc06 checks the report after "Open in a new tab"; Sc02 checks the embedded report and the presence of "Open in a new tab". They differ in what they check (embed and link present vs. content after opening), so this is a mild overlap, not a Duplicate.
3. Every scenario has "Given the data pusher has pushed ... as described in QAD-104" with no ingest-token step. This is fine, since QAD-104 owns the push. Sc01 to Sc07 do not retest QAD-104's replacement or token rules, and I found no conflict with QAD-104.
4. QAD-106 ("access requires a QAD-106 people session"): the feature does not test that an unauthenticated user cannot open a report. That belongs to QAD-106, so it is not Missing here. All scenarios start from a logged-in state. Good.

**Weak**

1. Sc04: `the details page should clearly state that this run did not upload an HTML bundle`. The expected text is not stated, so it passes on any wording. This is acknowledged in note Q3 as an open question about the wording, so it is minor.
2. Sc01 third `Then`: `the details page should not show test "payment can be completed" of run "run-105-y"`. It only checks the absence of one test from the other run. The requirement says "does not open another run". A stronger check: the detail page shows run-105-x's identity or counts and not run-105-y's (3/1/1/2 counts already differ from 4/0/0/0, so the counts assertion partly covers this). The weakness is minor.
3. Sc02 `Then the details page should offer "Open in a new tab"` checks only that the control exists, not that it opens the stored report. QAD-104 Sc06 covers the opening behavior, so this is acceptable under the ownership rule.
4. Sc07: `Then the details page should show no entry point for any trace, screenshot, or video`. It is asserted with a failed test that has error text, which is a good precondition. It does not say how a tester recognizes an "entry point" (link, button, icon). The setup is fine, but the check is loosely worded.

## Summary

- Missing: 3 (C2 basic info, blocked by Q2; C8 bundle non-promise; C11 cell values, likely covered by QAD-104 Sc02).
- Unsupported: none.
- Guessed: 1 (Sc01 four count categories, recorded in note Q3).
- Duplicate: none.
- CrossStory: Sc03 needs bundle and screenshot data that note Q1 says does not exist; Sc02 mildly overlaps QAD-104 Sc06. No conflicts.
- Weak: 4 minor (Sc04 wording, Sc01 other-run check, Sc02 link, Sc07 wording).

---
## Author handling

- Missing 1 (bundle non-promise): rejected. A09 is a limit clause with no observable outcome; the text promises nothing to assert.
- Missing 2 (cell values): rejected. Values of Project, Retries and the rest are owned by QAD-104 AC-02. QAD-105 AC-03 only says which columns are listed.
- Missing 3 (basic info): accepted as a real gap, blocked by note Q2.
- Guessed four counts: accepted as a stated risk. Already recorded in note Q3; the scenario keeps the QAD-102 AC-01 categories as Derived. Not resolved silently.
- CrossStory Sc03 data not creatable: accepted as a known precondition (note Q1). The scenario is designed from AC-02 and needs a tester-prepared bundle; no change.
- CrossStory Sc02 overlap with QAD-104 scenario 06: rejected as a duplicate. They fail for different reasons (embedding vs saved file opened in a new tab).
- Weak 1, 4: rejected. Wording is unstated in the text (Q3); asserting more would choose a result.
- Weak 2: rejected. The counts Then and the test-name Thens already separate the two runs; a third check adds nothing.
- Weak 3: rejected. Opening behaviour is asserted in QAD-104 scenario 06; AC-02 only says the control is provided.
