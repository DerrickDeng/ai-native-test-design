# QAD-107 — AI adoption and human editing cost

Simulated requirement: not a Jira export and not a real historical requirement; contains no company material.

- Snapshot date: 2026-09-28
- Type: requirement draft written from the current local QA Dashboard code and docs.
- Effective in environment: unknown; the date does not prove deployment.

## User Story

As a QA, I want to know whether generated content was adopted and whether it was edited before adoption, rather than treating adoption as correctness.

## Entry point

Local QA Dashboard; people start from the sign-in page, and data is pushed through the local API.

## Acceptance Criteria

### AC-01

For normal logs with items human review records, generated is the number of generated items, accepted is the number of items with accepted=true, and accepted_unchanged is the number of items with accepted=true and edited=false.

### AC-02

adoption = accepted/generated; unchanged adoption = accepted_unchanged/generated. Sum the counts first and then divide; do not simply average the per-run percentages.

### AC-03

A log with no items and no explicit generated does not contribute to the adoption numerator or denominator, but can still have cost, tokens, and a QAD-108 comparison. A zero denominator shows —.

### AC-04

The AI page shows Adoption, Unchanged adoption, and Accuracy (F1) together; a high adoption does not prove high accuracy. Evidence of correctness is defined by QAD-108.

### AC-05

Current AI statistics are filtered by the date window; Application, Region, and Environment do not filter AgentRun. This limit must be read together with the QAD-101 shared filter row.

## Related Stories

QAD-101, QAD-108

## Sources

- qa-dashboard/apps/api/src/qa_dashboard/ingest/agent_logs.py
- qa-dashboard/apps/api/src/qa_dashboard/metrics/ai.py
- qa-dashboard/apps/web/src/pages/AiPage.tsx
