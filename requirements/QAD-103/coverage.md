# QAD-103 Coverage Trace

## Related Stories

| Story | Relation | Handling |
|---|---|---|
| QAD-101 | Shared rule | Read QAD-101 formatted snapshot and note, and testcases/QAD-101.feature. QAD-101 owns the filter scope. AC-01's "Within the scope selected by QAD-101" is owned there, and QAD-101 scenarios 04, 05 and 11 already assert the ranking under filters. Scenarios here start from the default filter in `Given`. |
| QAD-102 | Interaction | Read QAD-102 formatted snapshot and note, and testcases/QAD-102.feature. QAD-102 owns the latest-run Flaky count and the pass-rate formula. This Story adds only that the ranking score is a different metric and that insufficient history does not remove a flaky result from the pass rate (AC-05, AC-06). Only scenario 11 combines the two. |

## Atoms

| Atom | Source | Quote | Disposition | Ref |
|---|---|---|---|---|
| A01 | AC-01 | history is grouped by test identity (file + full title path + project) | Covered | |
| A02 | AC-01 | Within the scope selected by QAD-101 | Owned elsewhere | QAD-101 |
| A03 | AC-01 | sorted by run start time from oldest to newest | Covered | |
| A04 | AC-02 | Only tests with at least 3 historical observations enter scoring | Covered | |
| A05 | AC-02 | this eligibility check happens before skipped records are removed | Covered | |
| A06 | AC-02 | A test with no valid records after removing skipped does not enter the ranking | Covered | |
| A07 | AC-03 | Valid records use only non-skipped statuses | Covered | |
| A08 | AC-03 | passed and flaky are both in the pass class | Covered | |
| A09 | AC-03 | flips is the number of times adjacent valid records switch between the pass class and the fail class | Covered | |
| A10 | AC-04 | (flaky_runs + flips) | Covered | |
| A11 | AC-04 | number of non-skipped valid records | Covered | |
| A12 | AC-04 | Only a score above zero enters the ranking | Covered | |
| A13 | AC-04 | order by score descending | Covered | |
| A14 | AC-04 | then by number of valid records descending | Covered | |
| A15 | AC-05 | A test that always failed | Covered | |
| A16 | AC-05 | or always passed | Covered | |
| A17 | AC-05 | The latest-run flaky count from QAD-102 is not the same metric as this score | Covered | |
| A18 | AC-06 | The recent history in the ranking is shown from oldest to newest | Covered | |
| A19 | AC-06 | not having enough history does not mean the test is stable | Not testable | Interpretive limit; the requirement defines no display for a "stable" state (see Q4) |
| A20 | AC-06 | nor that this execution's flaky results should be deducted from the pass rate | Covered | |
| A21 | User Story | rather than calling every failed test flaky | Covered | |

## Assertions

| Then | Atom | Type | Basis |
|---|---|---|---|
| 01.1 | A01 | Derived | If any one of file, full title path or project were ignored, the two records of the base test plus the differing record would merge into one test with history failed, passed, failed (3 records, 2 flips, score 2/3) and be ranked. Each Examples row changes exactly one component, so the base test has 2 records and the other test has 1, and neither reaches 3. |
| 02.1 | A03 | Derived | By start time sign in is passed, failed, passed, failed: 3 flips, score 3/4 = 0.75. In push order it would be passed, passed, failed, failed: 1 flip, 0.25. pay is passed, failed, passed, passed by start time: 2 flips, 0.5, the same in push order. So sign in ranks first only when sorted by start time. |
| 02.1 | A09 | Derived | sign in flips: passed to failed, failed to passed, passed to failed = 3. pay flips: passed to failed, failed to passed = 2. |
| 02.1 | A10 | Derived | flaky_runs is 0 for both, so the numerators are the flips 3 and 2. |
| 02.1 | A13 | Derived | 0.75 is above 0.5, so sign in is first. |
| 03.1 | A04 | Derived | sign in has 3 records and is eligible; its score (0 + 2) / 3 = 0.67 is above zero. pay has 2 records (passed, failed): score would be 1/2 = 0.5 but it is not eligible. |
| 04.1 | A05 | Derived | sign in has 3 records including skipped, so it is eligible. Valid records are passed, failed: 1 flip, score 1/2 = 0.5, above zero. If eligibility counted only non-skipped records it would have 2 and be excluded. |
| 05.1 | A06 | Derived | 3 records, so eligible, but all skipped, so 0 valid records. |
| 06.1 | A07 | Derived | sign in valid records are passed, failed (skipped removed). |
| 06.1 | A11 | Derived | sign in score = 1 / 2 valid records = 0.5, not 1/3. pay: passed, passed, failed, failed, passed has 2 flips over 5 records = 0.4. 0.5 is above 0.4; with skipped in the denominator sign in would be 1/3 = 0.33, below 0.4. |
| 06.1 | A13 | Derived | 0.5 is above 0.4, so sign in is first. |
| 07.1 | A08 | Derived | sign in passed, flaky, passed are all pass class: 0 flips, score (1 + 0) / 3 = 0.33. If flaky were fail class it would have 2 flips and score 1.0, above pay. |
| 07.1 | A10 | Derived | flaky_runs = 1 for sign in. Without it the score would be 0 and sign in would not be ranked. pay: passed, failed, passed, passed has 2 flips, score 2/4 = 0.5. |
| 07.1 | A13 | Derived | 0.5 is above 0.33, so pay is first. |
| 08.1 | A14 | Derived | sign in passed, failed, skipped, skipped, skipped: 5 history records, valid 2, 1 flip, score 1/2 = 0.5. pay passed, failed, passed, passed: 4 history records, valid 4, 2 flips, score 2/4 = 0.5. Scores tie. pay has more valid records (4 against 2), so it is first. By total history records sign in (5) would be first, so the data separates valid record count from total count. |
| 09.1 | A12 | Derived | Score is 0/3 = 0 for both histories, which is not above zero. |
| 09.1 | A15 | Derived | failed, failed, failed: 0 flaky_runs, 0 flips. |
| 09.1 | A16 | Derived | passed, passed, passed: 0 flaky_runs, 0 flips. |
| 09.1 | A21 | Derived | A test that always failed is not listed as flaky. |
| 10.1 | A18 | Stated | |
| 10.1 | A03 | Derived | By start time the history is passed (3 days ago), passed (2 days ago), failed (1 day ago). Push order is passed, failed, passed, so following push order would show a different sequence. |
| 11.1 | A17 | Derived | sign in passed, failed, passed has 3 records, 2 flips, score 2/3, so it is ranked although the latest run has no flaky result for it. pay is flaky in the latest run but has 1 record, so it is not ranked. |
| 11.2 | A17 | Derived | The latest date is 1 day ago; its flaky results are only pay, so Flaky is 1 (QAD-102 AC-01, AC-03). |
| 12.1 | A09 | Derived | passed, skipped, passed: with skipped ignored the valid records are passed, passed, so 0 flips and score 0, not ranked. If skipped were treated as a fail class there would be 2 flips, score 2/3, and sign in would be ranked. |
| 12.1 | A07 | Derived | The skipped record is not used as a valid record, so it neither adds a flip nor changes the class of its neighbours. |
| 11.3 | A20 | Derived | Latest date results: passed sign in and scan code = 2, flaky pay = 1, failed cart = 1. Rate = (2 + 1) / 4 = 75% (QAD-102 AC-02). pay has insufficient history yet still counts in the numerator; deducting it would give 2/3. |
