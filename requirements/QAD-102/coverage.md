# QAD-102 Coverage Trace

## Related Stories

| Story | Relation | Handling |
|---|---|---|
| QAD-101 | Prerequisite | Read QAD-101 formatted snapshot and note, and testcases/QAD-101.feature. QAD-101 owns the filter defaults and scope. Scenarios here start from the default filter in `Given`. The scope part of the summary rule ("within the current QAD-101 filter scope") is already shown by QAD-101 scenario 04, so it is not retested here. |
| QAD-103 | Shared rule | Read QAD-103 formatted snapshot and note. QAD-103 owns the cross-run flaky score and ranking. AC-05 here only points to it. No ranking scenario is written here. |
| QAD-104 | Prerequisite | Read QAD-104 formatted snapshot (no note.md). QAD-104 owns how a pushed report becomes stored run data, including status and retry count. Scenarios here start from run data that already exists in `Given`. Ingest behavior is not asserted. |

## Atoms

| Atom | Source | Quote | Disposition | Ref |
|---|---|---|---|---|
| A01 | AC-01 | passed, failed, flaky, and skipped are counted separately | Covered | |
| A02 | AC-01 | flaky means the test failed in this execution and passed on retry | Covered | |
| A03 | AC-01 | it does not add to the raw Passed count | Covered | |
| A04 | AC-01 | but it counts in the pass-rate numerator | Covered | |
| A05 | AC-02 | Executed = total - skipped | Covered | |
| A06 | AC-02 | pass rate = (passed + flaky) / executed | Covered | |
| A07 | AC-02 | The daily trend and project groups use the same definition | Covered | |
| A08 | AC-02 | do not count skipped in the denominator | Covered | |
| A09 | AC-03 | The summary card uses the latest date with data within the current QAD-101 filter scope | Owned elsewhere | QAD-101 |
| A10 | AC-03 | the latest date with data | Covered | |
| A11 | AC-03 | it does not merge the whole date window into one pass rate | Covered | |
| A12 | AC-03 | The comparison baseline is the previous date with data in that scope | Question | Q2 |
| A13 | AC-03 | which is not guaranteed to be the previous calendar day | Question | Q2 |
| A14 | AC-04 | When executed is zero | Covered | |
| A15 | AC-04 | or the scope has no data, the pass rate shows — | Covered | |
| A16 | AC-04 | not 0% or 100% | Covered | |
| A17 | AC-04 | When there is no previous-day data, no pass-rate change is shown | Covered | |
| A18 | AC-05 | Each Recent runs row uses that run's own counts for its pass rate | Covered | |
| A19 | AC-05 | for the difference between this execution's flaky count and the cross-run instability score, see QAD-103 | Owned elsewhere | QAD-103 |

## Assertions

| Then | Atom | Type | Basis |
|---|---|---|---|
| 01.1 | A01 | Stated | |
| 01.1 | A03 | Derived | run-A has 5 passed and 3 flaky; Passed 5 (not 8) shows flaky did not add to Passed. |
| 01.2 | A01 | Stated | |
| 01.2 | A02 | Derived | The 3 tests that failed first and passed on retry are the flaky ones, so Flaky is 3. |
| 01.3 | A01 | Stated | |
| 01.3 | A02 | Derived | Failed stays 2 (the 2 tests still failing after retry), so flaky tests are not counted as failed. |
| 02.1 | A04 | Derived | (passed 5 + flaky 3) / executed 10 = 80%; without flaky it would be 50%, and (passed + failed) / 10 would be 70%. |
| 02.1 | A05 | Derived | total 5+2+3+4 = 14, skipped 4, executed = 14 - 4 = 10. |
| 02.1 | A06 | Derived | (5 + 3) / 10 = 80%. |
| 02.1 | A08 | Derived | With skipped in the denominator the result would be 8/14, not 80%. |
| 03.1 | A07 | Derived | 3 days ago: total 10, skipped 2, executed 8, (5+1)/8 = 75%. 1 day ago: (5+3)/10 = 80%. |
| 04.1 | A07 | Derived | chromium: total 12, skipped 2, executed 10, (4+1)/10 = 50%. firefox: total 10, skipped 6, executed 4, (2+2)/4 = 100%. |
| 05.1 | A10 | Derived | Latest date with data is 1 day ago: (5+3)/10 = 80%. |
| 05.2 | A11 | Derived | Merging both days gives (5+1+5+3)/(8+10) = 14/18, which differs from the 80% of the latest date, and the summary must not show it. |
| 06.1 | A17 | Derived | Only run-A is in the Last 14 days scope, so no earlier date with data exists in scope; run-Z at 40 days is outside it. |
| 07.1 | A14 | Derived | total 5, skipped 5, executed = 5 - 5 = 0. |
| 07.1 | A16 | Stated | |
| 08.1 | A15 | Derived | Only run-Z exists and it is outside Last 14 days, so the scope has no data. |
| 08.1 | A16 | Stated | |
| 09.1 | A18 | Derived | run-R1: (5+1)/(10-2) = 75%. run-R2: (5+3)/(14-4) = 80%. Same-day combined would be 14/18. |
