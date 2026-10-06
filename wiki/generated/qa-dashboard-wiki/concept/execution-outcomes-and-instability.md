---
type: concept
title: Execution outcomes and instability metrics
description: Status-count, pass-rate, empty-state, and cross-run flaky-ranking rules for execution data.
tags: [execution, pass-rate, flaky, bdd]
---

# Execution outcomes and instability metrics

The Dashboard has two distinct meanings of “flaky”: a retry outcome within one run and an instability score across historical runs. BDD automation must not merge them.

## Explicit rules

- `passed`, `failed`, `flaky`, and `skipped` are separate counts. A flaky result failed in the execution and passed on retry; it is excluded from raw Passed but included in the pass-rate numerator. [QAD-102](viking://resources/qa-dashboard-sources/QAD-102/QAD-102-2026-09-28-formatted.md)
- `executed = total - skipped`; `pass rate = (passed + flaky) / executed`. Daily trend and project groups use that definition. [QAD-102](viking://resources/qa-dashboard-sources/QAD-102/QAD-102-2026-09-28-formatted.md)
- The summary uses the latest date with data in the current execution filter scope, not an aggregate over the window. Its baseline is the prior date with data in scope. A zero-executed or no-data scope shows `—`; no prior-day data shows no pass-rate change. [QAD-102](viking://resources/qa-dashboard-sources/QAD-102/QAD-102-2026-09-28-formatted.md)
- Recent runs calculate their pass rates from each run’s own counts. [QAD-102](viking://resources/qa-dashboard-sources/QAD-102/QAD-102-2026-09-28-formatted.md)
- Historical ranking groups by file + full title path + project and orders history oldest to newest. Eligibility is at least three observations before skipped records are removed; valid scoring records are non-skipped, with passed and flaky in the pass class. [QAD-103](viking://resources/qa-dashboard-sources/QAD-103/QAD-103-2026-09-28-formatted.md)
- `flaky_score = (flaky_runs + flips) / non-skipped valid records`; flips are adjacent valid pass/fail-class switches. Only positive scores rank, ordered by descending score then descending valid-record count. Always-pass and always-fail tests do not rank. [QAD-103](viking://resources/qa-dashboard-sources/QAD-103/QAD-103-2026-09-28-formatted.md)

## BDD test implications

Build fixtures that independently vary retry outcomes, skips, run dates, and historical status sequences. Assert that a latest-run flaky count can affect pass rate while the same test’s historical score is a different value. Use dates with data separated by an empty calendar day to test selection of the latest populated date; do not assert a numeric or formatted change value.

**Inference:** a useful ranking test can isolate tie-breaking with equal positive scores but different valid-record counts, because the ordering rule states both dimensions. This follows [QAD-103](viking://resources/qa-dashboard-sources/QAD-103/QAD-103-2026-09-28-formatted.md).

## Open questions

- Passed-card helper text may mention flaky although the displayed Passed value excludes it; whether to change text is undecided, and the counts must remain distinct. [QAD-102 questions](viking://resources/qa-dashboard-sources/QAD-102-note/note.md)
- Formula, sign, unit, and display of pass-rate change are unspecified; the “previous date with data” baseline is not visibly verifiable from a specified result. [QAD-102 questions](viking://resources/qa-dashboard-sources/QAD-102-note/note.md)
- Precision, locations of counts and `—`, and aggregation of multiple runs on the latest populated date are unspecified. [QAD-102 questions](viking://resources/qa-dashboard-sources/QAD-102-note/note.md)
- The current eligibility ordering can allow skipped observations to satisfy the three-record threshold; requiring three non-skipped records is undecided. The failure list may include intermittently failing tests, despite “consistently failing” wording. Ranking-row fields, history length, and visible treatment of insufficient history are also unspecified. [QAD-103 questions](viking://resources/qa-dashboard-sources/QAD-103-note/note.md)

## Sources

- [QAD-102 — Execution pass rate and empty data](viking://resources/qa-dashboard-sources/QAD-102/QAD-102-2026-09-28-formatted.md)
- [QAD-102 simulated requirement questions](viking://resources/qa-dashboard-sources/QAD-102-note/note.md)
- [QAD-103 — Flaky ranking and this execution’s results](viking://resources/qa-dashboard-sources/QAD-103/QAD-103-2026-09-28-formatted.md)
- [QAD-103 simulated requirement questions](viking://resources/qa-dashboard-sources/QAD-103-note/note.md)