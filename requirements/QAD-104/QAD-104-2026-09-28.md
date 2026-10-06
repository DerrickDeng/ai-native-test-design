# QAD-104 — Report ingestion and data identity

Simulated requirement: not a Jira export and not a real historical requirement; contains no company material.

- Snapshot date: 2026-09-28
- Type: requirement draft written from the current local QA Dashboard code and docs.
- Effective in environment: unknown; the date does not prove deployment.

## User Story

As a data pusher, I want the Dashboard to receive execution reports and update the data when the same report is pushed again.

## Entry point

Local QA Dashboard; people start from the sign-in page, and data is pushed through the local API.

## Acceptance Criteria

### AC-01

Accept the suites format of the Playwright JSON reporter and the files format of the report embedded in index.html. Do not treat the HTML summary alone as complete failure details; merge the detailed per-file results in the same zip by testId.

### AC-02

Keep status, project, feature title, duration, retry count, and error message from the test results; identify the file-level suite of the JSON reporter by title == file, and do not lose the feature title just because an ordinary describe suite also has a file.

### AC-03

Pushing the same report again replaces the records of the same run and must not add a duplicate run or duplicate test results.

### AC-04

A push may omit the HTML bundle and still keeps the JSON report and test data for review in QAD-105; when a bundle is included, the report files are saved.

### AC-05

API pushes require a bearer ingest token; a browser session alone is not enough. Read access for people is managed by QAD-106.

## Related Stories

QAD-102, QAD-105, QAD-106

## Sources

- qa-dashboard/apps/api/src/qa_dashboard/ingest/playwright.py
- qa-dashboard/apps/api/src/qa_dashboard/routes/ingest.py
- qa-dashboard/apps/api/tests/test_playwright_parser.py
