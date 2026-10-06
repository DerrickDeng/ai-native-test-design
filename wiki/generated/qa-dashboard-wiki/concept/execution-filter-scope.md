---
type: concept
title: Execution filter scope
description: Rules for filtering Local QA Dashboard execution data and retaining filter selections across interactions.
tags: [execution, filters, dashboard, bdd]
---

# Execution filter scope

Execution filter scope is the shared scope for the execution page’s metrics and lists. It is not evidence that the same dimensions apply to AI data; this distinction prevents BDD scenarios from overextending a common filter row.

## Explicit rules

- On first Dashboard entry, the date is **Last 14 days**; Application, Region, and Environment are **All**. The UI offers only Last 7, 14, 30, and 90 days. [QAD-101](viking://resources/qa-dashboard-sources/QAD-101/QAD-101-2026-09-28-formatted.md)
- The execution-page summary, trend, project groups, Recent runs, failure list, and flaky ranking use one scope. Selected dimensions restrict together; **All** does not restrict its dimension. [QAD-101](viking://resources/qa-dashboard-sources/QAD-101/QAD-101-2026-09-28-formatted.md)
- Changing one filter retains the others, Dashboard-tab switching retains state, and an earlier late response must not replace the latest selection’s result. [QAD-101](viking://resources/qa-dashboard-sources/QAD-101/QAD-101-2026-09-28-formatted.md)
- The API accepts `days` from 1 through 180. This does not imply custom date input in the UI. [QAD-101](viking://resources/qa-dashboard-sources/QAD-101/QAD-101-2026-09-28-formatted.md)
- AI statistics are currently filtered by date only; Application, Region, and Environment do not filter AgentRun. [QAD-107](viking://resources/qa-dashboard-sources/QAD-107/QAD-107-2026-09-28-formatted.md) [QAD-108](viking://resources/qa-dashboard-sources/QAD-108/QAD-108-2026-09-28-formatted.md)

## BDD test implications

Use one fixture set whose execution records differ by all four dimensions, then assert the same restricted population in each listed execution surface. Exercise an out-of-order response only as a latest-selection preservation check. Keep AI tests date-window-only; do not reuse an execution dimension-filter assertion on the AI page.

**Inference:** because the requirement names a common execution scope but names a date-only AI limit, acceptance scenarios should treat these as separate contracts, even if controls look shared. This is an inference from [QAD-101](viking://resources/qa-dashboard-sources/QAD-101/QAD-101-2026-09-28-formatted.md) and [QAD-107](viking://resources/qa-dashboard-sources/QAD-107/QAD-107-2026-09-28-formatted.md), not a claim about future behavior.

## Open questions

- Whether application or other dimension filtering will later be added for AI or defect metrics is undecided. [QAD-101 questions](viking://resources/qa-dashboard-sources/QAD-101-note/note.md)
- The tabs covered by filter-state retention are not listed. The note’s proposed traversal is execution page → AI page → execution page, with assertion only after returning; it does not establish whether other tabs expose the controls. [QAD-101 questions](viking://resources/qa-dashboard-sources/QAD-101-note/note.md)
- The API endpoint, acceptance observation, and behavior outside 1–180 are unspecified. Boundary acceptance at 1 and 180 is the stated test design; no out-of-range result should be invented. [QAD-101 questions](viking://resources/qa-dashboard-sources/QAD-101-note/note.md)

## Sources

- [QAD-101 — Shared filters and execution data scope](viking://resources/qa-dashboard-sources/QAD-101/QAD-101-2026-09-28-formatted.md)
- [QAD-101 simulated requirement questions](viking://resources/qa-dashboard-sources/QAD-101-note/note.md)
- [QAD-107 — AI adoption and human editing cost](viking://resources/qa-dashboard-sources/QAD-107/QAD-107-2026-09-28-formatted.md)
- [QAD-108 — AI Golden comparison and unknown values](viking://resources/qa-dashboard-sources/QAD-108/QAD-108-2026-09-28-formatted.md)