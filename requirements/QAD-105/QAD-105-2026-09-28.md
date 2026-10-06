# QAD-105 — Review a report from the run list

Simulated requirement: not a Jira export and not a real historical requirement; contains no company material.

- Snapshot date: 2026-09-28
- Type: requirement draft written from the current local QA Dashboard code and docs.
- Effective in environment: unknown; the date does not prove deployment.

## User Story

As a QA, I want to view the report of a run and know what evidence is currently available.

## Entry point

Local QA Dashboard; people start from the sign-in page, and data is pushed through the local API.

## Acceptance Criteria

### AC-01

A signed-in person clicks View report in Recent runs, which opens the details of the selected run; it shows that run's basic information and status counts and does not open another run.

### AC-02

With a bundle, the saved original HTML report is embedded and Open in a new tab is offered. Uploaded report assets are kept; no trace, screenshot, or video that the original report did not contain is promised.

### AC-03

Without a bundle, Test details is shown, grouped by feature, listing Test, Project, Result, Duration, Retries, and Error; it states clearly that this run did not upload an HTML bundle. A row with no error message shows —.

### AC-04

The JSON fallback does not show made-up entry points for traces, screenshots, or videos. Report content and error messages come from QAD-104, and access requires a QAD-106 people session.

## Related Stories

QAD-104, QAD-106

## Sources

- qa-dashboard/apps/web/src/pages/RunReportPage.tsx
- qa-dashboard/apps/api/src/qa_dashboard/routes/dashboard.py
- qa-dashboard/apps/api/src/qa_dashboard/routes/reports.py
