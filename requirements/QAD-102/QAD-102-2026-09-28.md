# QAD-102 — Execution pass rate and empty data

Simulated requirement: not a Jira export and not a real historical requirement; contains no company material.

- Snapshot date: 2026-09-28
- Type: requirement draft written from the current local QA Dashboard code and docs.
- Effective in environment: unknown; the date does not prove deployment.

## User Story

As a QA, I want to tell final passes, passes after retry, failures, and skips apart, and see an accurate execution pass rate.

## Entry point

Local QA Dashboard; people start from the sign-in page, and data is pushed through the local API.

## Acceptance Criteria

### AC-01

passed, failed, flaky, and skipped are counted separately. flaky means the test failed in this execution and passed on retry; it does not add to the raw Passed count, but it counts in the pass-rate numerator.

### AC-02

Executed = total - skipped; pass rate = (passed + flaky) / executed. The daily trend and project groups use the same definition and do not count skipped in the denominator.

### AC-03

The summary card uses the latest date with data within the current QAD-101 filter scope; it does not merge the whole date window into one pass rate. The comparison baseline is the previous date with data in that scope, which is not guaranteed to be the previous calendar day.

### AC-04

When executed is zero or the scope has no data, the pass rate shows —, not 0% or 100%. When there is no previous-day data, no pass-rate change is shown.

### AC-05

Each Recent runs row uses that run's own counts for its pass rate; for the difference between this execution's flaky count and the cross-run instability score, see QAD-103.

## Related Stories

QAD-101, QAD-103, QAD-104

## Sources

- qa-dashboard/apps/api/src/qa_dashboard/metrics/execution.py
- qa-dashboard/apps/web/src/pages/ExecutionPage.tsx
- qa-dashboard/apps/web/src/charts/primitives.tsx
