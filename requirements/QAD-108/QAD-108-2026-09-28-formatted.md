# QAD-108 — AI Golden comparison and unknown values

Simulated requirement: not a Jira export and not a real historical requirement; contains no company material.

- Snapshot date: 2026-09-28
- Type: requirement draft written from the current local QA Dashboard code and docs.
- Effective in environment: unknown; the date does not prove deployment.

## User Story

As a QA, I want to judge content accuracy with a reviewed Golden comparison, and tell missing evidence apart from a zero score.

## Entry point

Local QA Dashboard; people start from the sign-in page, and data is pushed through the local API.

## Acceptance Criteria

### AC-01

Accuracy is based on comparison: precision = matched/(matched+extra), recall = matched/golden_total; sum the counts first and then calculate, and do not derive matched from accepted.

### AC-02

When both precision and recall can be calculated and their sum is above zero, F1 = 2*precision*recall/(precision+recall). In the current implementation, when either component cannot be calculated or their sum is zero, F1 shows —.

### AC-03

A log without comparison does not contribute to the accuracy numerator or denominator, but can still contribute QAD-107 adoption data. When no Golden comparison can be calculated, the related accuracy shows — and must not be faked as 0%.

### AC-04

The AI page shows Accuracy (F1) together with Precision and Recall; grouped by agent, model, and prompt version, it keeps an evidence meaning different from adoption.

### AC-05

Current statistics are filtered only by the date window; do not add AI dimension assertions just because QAD-101 has Application/Region/Environment controls.

## Related Stories

QAD-101, QAD-107

## Sources

- qa-dashboard/apps/api/src/qa_dashboard/metrics/ai.py
- qa-dashboard/apps/api/src/qa_dashboard/ingest/agent_logs.py
- qa-dashboard/apps/web/src/pages/AiPage.tsx
