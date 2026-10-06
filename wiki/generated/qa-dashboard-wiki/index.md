---
type: index
title: Local QA Dashboard Acceptance-Test Knowledge
description: Navigation for simulated Local QA Dashboard requirements synthesized for BDD implementors.
tags: [qa-dashboard, bdd, acceptance-testing, simulated-requirements]
---

# Local QA Dashboard Acceptance-Test Knowledge

This Wiki synthesizes simulated requirement drafts and review notes for people designing acceptance tests for the local QA Dashboard. The dated snapshots are drafts only: they do not establish deployed or production behavior.

## Execution data

- [Execution filter scope](concept/execution-filter-scope.md) — Shared execution-page filters, their defaults, scope, and persistence boundaries.
- [Execution outcomes and instability metrics](concept/execution-outcomes-and-instability.md) — Status counts, pass-rate semantics, empty states, and cross-run flaky ranking.

## Reports and access

- [Report ingestion and review evidence](concept/report-ingestion-and-review-evidence.md) — Accepted report forms, idempotent run identity, and evidence available in run review.
- [People sessions and ingest authorization](concept/people-sessions-and-ingest-authorization.md) — Sign-in behavior, session invalidation, protected reads, and the separate ingest token.

## AI metrics

- [AI adoption metrics](concept/ai-adoption-metrics.md) — Adoption and unchanged-adoption aggregation, the date-only filter limit, and ambiguous cases.
- [AI Golden-comparison accuracy](concept/ai-golden-comparison-accuracy.md) — Precision, recall, F1, unknown values, and the distinction from adoption.

## Evidence status

All pages link rules to the supplied Story or note that states them. “Inference” identifies a limited test-design conclusion drawn from rules; “Open questions” preserves unresolved notes rather than supplying behavior.

## Sources

- [QAD-101 — Shared filters and execution data scope](viking://resources/qa-dashboard-sources/QAD-101/QAD-101-2026-09-28-formatted.md)