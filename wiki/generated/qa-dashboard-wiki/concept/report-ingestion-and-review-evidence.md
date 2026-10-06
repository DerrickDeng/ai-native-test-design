---
type: concept
title: Report ingestion and review evidence
description: Contracts for Playwright report ingestion, run replacement, and the evidence presented when reviewing a run.
tags: [reports, ingestion, playwright, evidence, bdd]
---

# Report ingestion and review evidence

Report ingestion establishes the data available to run review. A run may remain reviewable without an HTML bundle, but the fallback must expose only evidence supplied by the report.

## Explicit rules

- Ingestion accepts Playwright JSON reporter `suites` and report-in-`index.html` `files` formats; detailed per-file results in one zip are merged by `testId`, and an HTML summary alone is not complete failure detail. [QAD-104](viking://resources/qa-dashboard-sources/QAD-104/QAD-104-2026-09-28-formatted.md)
- Result data retains status, project, feature title, duration, retry count, and error message. A JSON reporter file-level suite is identified by `title == file`; an ordinary `describe` suite named `file` must not erase the feature title. [QAD-104](viking://resources/qa-dashboard-sources/QAD-104/QAD-104-2026-09-28-formatted.md)
- Re-pushing the same report replaces that run’s records; it must not duplicate the run or its results. Reports may omit a bundle while retaining JSON and test data; included bundle files are saved. [QAD-104](viking://resources/qa-dashboard-sources/QAD-104/QAD-104-2026-09-28-formatted.md)
- A signed-in reader selecting **View report** in Recent runs sees the selected run’s details, basic information, and status counts. [QAD-105](viking://resources/qa-dashboard-sources/QAD-105/QAD-105-2026-09-28-formatted.md)
- With a bundle, the original HTML is embedded and can open in a new tab; assets are retained, but absent trace, screenshot, or video is not promised. Without a bundle, Test details are grouped by feature and list Test, Project, Result, Duration, Retries, and Error; missing errors show `—`, and no trace/screenshot/video entry points are invented. [QAD-105](viking://resources/qa-dashboard-sources/QAD-105/QAD-105-2026-09-28-formatted.md)

## BDD test implications

Test the replacement contract by pushing identical report identity twice and checking one run and one set of results. For fallback review, use JSON-only data and assert supplied fields, grouping membership, absent-error placeholder, and an explicit no-bundle statement—not HTML-only artifacts. Bundle-mode assertions require suitable bundle evidence.

**Inference:** an end-to-end fallback scenario can verify that fields retained at ingestion are the fields listed in Test details, but it should not claim every retained field is visible elsewhere. This follows [QAD-104](viking://resources/qa-dashboard-sources/QAD-104/QAD-104-2026-09-28-formatted.md) and [QAD-105](viking://resources/qa-dashboard-sources/QAD-105/QAD-105-2026-09-28-formatted.md).

## Open questions

- Available prepared data covers JSON fallback only; no execution evidence for HTML bundle, trace, screenshot, or video behavior is provided. [QAD-105 questions](viking://resources/qa-dashboard-sources/QAD-105-note/note.md)
- “Basic information,” status-count categories and possible total, and the exact no-bundle text are not specified. [QAD-105 questions](viking://resources/qa-dashboard-sources/QAD-105-note/note.md)
- Feature-group title text is unresolved; the note says it depends on a referenced QAD-104 note that is not among the supplied sources, so only same/different grouping is currently bounded. [QAD-105 questions](viking://resources/qa-dashboard-sources/QAD-105-note/note.md)

## Sources

- [QAD-104 — Report ingestion and data identity](viking://resources/qa-dashboard-sources/QAD-104/QAD-104-2026-09-28-formatted.md)
- [QAD-105 — Review a report from the run list](viking://resources/qa-dashboard-sources/QAD-105/QAD-105-2026-09-28-formatted.md)
- [QAD-105 simulated requirement questions](viking://resources/qa-dashboard-sources/QAD-105-note/note.md)