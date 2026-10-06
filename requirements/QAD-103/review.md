# QAD-103 independent review

## Reviewer output (returned text, unchanged)

Review of testcases/QAD-103.feature against the 2026-09-28 requirement. I read only the allowed files. Summary: 2 Missing, 1 Guessed, 3 Weak, 1 CrossStory, and no Duplicate or Unsupported findings.

STEP 1-2. Claims and proof (scenario numbers refer to QAD-103.feature)

- Scope is the QAD-101 filter range: owned by QAD-101, whose s04, s05 and s11 assert the flaky ranking under filters. Not Missing here.
- Identity is file, full title path and project: proved by 01. Its three Examples change file, path and project one at a time. The path example keeps the same leaf and changes only the parent.
- History is ordered oldest to newest by run start time: proved by 02 for scoring. Push order differs from start order, and the ranking result flips if push order is used.
- Fewer than 3 history records are not ranked, and exactly 3 are ranked: proved by 03.
- The eligibility check happens before skipped is excluded: proved by 04.
- No valid record after excluding skipped means not ranked: proved by 05.
- Skipped is out of the denominator: proved by 06. auth is 1/2 = 0.5 and pay is 2/5 = 0.4. If skipped were in the denominator, auth would be 1/3 and the order would flip.
- Skipped is out of the adjacency check: see Missing 1.
- flaky is pass-class and counted in the numerator: proved by 07. Either alternative reading gives a different order or drops auth from the ranking.
- flips counts each pass-class/fail-class switch, including several switches: proved by 02, where auth has 3.
- Score above zero is required to be ranked: proved by 07 and 09.
- Sort by score descending: proved by 02, 06 and 07.
- Tie-break by valid record count descending: 08, but see Weak 1.
- Always-failed or always-passed tests are not ranked: proved by 09.
- The latest-run flaky count is a different metric from the score: proved by 11.
- Recent history is shown oldest to newest: 10, but see Weak 2.
- Insufficient history does not mean the test is stable: see Missing 2.
- Insufficient history does not mean this run's flaky is removed from the pass rate: proved by 11. The rate is 75%, and both subtracting flaky and dropping it would give a different value.

STEP 2. Missing

- Missing, no scenario (skipped in the adjacency check). Quote: "flips is the number of times adjacent valid records switch between the pass class and the fail class". Scenario 06's title says "skipped does not count as a valid record, in the adjacency check, or in the denominator", but its data cannot show the adjacency part. In auth (passed, skipped, failed), the flip count is 1 whether skipped is ignored or treated as either class. Only the denominator is isolated. A history like passed, skipped, passed would separate the two: 0 flips if skipped is ignored, 2 if skipped is treated as a failure.
- Missing, no scenario (no "stable" indication). Quote: "not having enough history does not mean the test is stable". 03 only shows the short-history test is absent from the ranking. Nothing asserts that it is not presented as stable. The text defines no display for this, so this may belong in note.md as an open item rather than a scenario.

STEP 3. Unsupported / Guessed

- Unsupported: none.
- Guessed, scenario 10. Quote from the requirement: "The recent history in the ranking is shown from oldest to newest". The Then "the recent history should show passed, passed, failed in that order" assumes each history item is shown as the status word. The text gives no item format. note.md Q3 says field display is undecided, yet the Then asserts literal words. Assert the order only, or record the format as an open item.

STEP 4. Duplicate

- None. 04, 06 and 08 each contain a passed, failed, skipped history, but only 04 isolates the eligibility rule.

STEP 5. CrossStory

- Scenario 11, QAD-102 dependence. Quote from QAD-102: "The summary card uses the latest date with data within the current QAD-101 filter scope; it does not merge the whole date window into one pass rate". Scenario 11's "the summary pass rate should be "75%"" and "the summary Flaky should be 1" hold only if the summary uses the latest date (run-3) alone. Merging all runs would give 4/6, about 67%. A failure of QAD-102's latest-date rule would therefore fail 11 for a QAD-102 reason. The "75%" format is also the assumption in QAD-102's note Q3, not text. Otherwise 11 does not retest QAD-102's formula or conflict with it. It uses a state QAD-102 does not create: a test with flaky in the latest run and too little history to be ranked.
- No conflict with QAD-101. Its s04 and s11 flaky-ranking outcomes are consistent with 01 to 09.

STEP 6. Weak

- Weak, scenario 08. Quote: "order by score descending, then by number of valid records descending". The tie-break data cannot tell valid record count from total history count. pay has 4 history and 4 valid records, while auth has 3 history and 2 valid, so pay comes first under either counting. Give the skipped-heavy test more total history than the other test but fewer valid records.
- Weak, scenario 10. Quote: "sorted by run start time from oldest to newest" and "The recent history in the ranking is shown from oldest to newest". Scenario 10 does not give a push order, and its runs are in time order. It proves the display is not newest-first. It does not prove the display follows start time rather than push order, because the out-of-order push in 02 only covers scoring.
- Weak, scenario 06. Same quote as Missing 1. Its title claims more than the data proves.

## Author handling

Accepted, feature changed:
- Missing 1 (adjacency) and Weak scenario 06: scenario 06 is now titled for valid records and the denominator only. New scenario 12 (passed, skipped, passed) separates "skipped ignored" from "skipped counted as a fail class".
- Weak scenario 08: the data now has 5 history records for sign in (2 valid) against 4 for pay (4 valid), so total count and valid count give different orders.
- Weak scenario 10: the runs are now pushed out of start-time order, so the scenario shows the display follows start time.

Accepted as an open question: Missing 2 became Q4 in note.md. Atom A19 stays Not testable.

Rejected:
- Guessed scenario 10 (status words): showing the order needs some item representation, and note.md Q3 already records that the display format is undecided. The Then asserts the sequence of statuses only.
- CrossStory scenario 11: the scenario is the interaction that AC-05 and AC-06 describe (a different metric, and insufficient history does not change the pass rate). It asserts no rule of QAD-102 by itself, and the "75%" value is derived from QAD-102 AC-02 as recorded in coverage.md.

The reviewer was not run again on the changed feature.
