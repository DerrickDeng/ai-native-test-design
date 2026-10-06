# QAD-103 — Flaky ranking and this execution's results

Simulated requirement: not a Jira export and not a real historical requirement; contains no company material.

- Snapshot date: 2026-09-28
- Type: requirement draft written from the current local QA Dashboard code and docs.
- Effective in environment: unknown; the date does not prove deployment.

## User Story

As a QA, I want to find tests that are unstable across repeated executions, rather than calling every failed test flaky.

## Entry point

Local QA Dashboard; people start from the sign-in page, and data is pushed through the local API.

## Acceptance Criteria

### AC-01

Within the scope selected by QAD-101, history is grouped by test identity (file + full title path + project) and sorted by run start time from oldest to newest.

### AC-02

Only tests with at least 3 historical observations enter scoring; this eligibility check happens before skipped records are removed. A test with no valid records after removing skipped does not enter the ranking.

### AC-03

Valid records use only non-skipped statuses. passed and flaky are both in the pass class; flips is the number of times adjacent valid records switch between the pass class and the fail class.

### AC-04

flaky_score = (flaky_runs + flips) / number of non-skipped valid records. Only a score above zero enters the ranking; order by score descending, then by number of valid records descending.

### AC-05

A test that always failed or always passed has a flaky_score of zero and does not enter the flaky ranking. The latest-run flaky count from QAD-102 is not the same metric as this score.

### AC-06

The recent history in the ranking is shown from oldest to newest; not having enough history does not mean the test is stable, nor that this execution's flaky results should be deducted from the pass rate.

## Related Stories

QAD-101, QAD-102

## Sources

- qa-dashboard/apps/api/src/qa_dashboard/metrics/flaky.py
- qa-dashboard/apps/api/tests/test_flaky_ranking.py
