# QAD-101 — Shared filters and execution data scope

Simulated requirement: not a Jira export and not a real historical requirement; contains no company material.

- Snapshot date: 2026-09-28
- Type: requirement draft written from the current local QA Dashboard code and docs.
- Effective in environment: unknown; the date does not prove deployment.

## User Story

As a QA, I want to filter execution data by date, application, region, and environment, so that every execution metric covers the same scope.

## Entry point

Local QA Dashboard; people start from the sign-in page, and data is pushed through the local API.

## Acceptance Criteria

### AC-01

On first entry to the Dashboard, the date defaults to Last 14 days; Application, Region, and Environment default to All. The date dropdown offers only Last 7 days, Last 14 days, Last 30 days, and Last 90 days.

### AC-02

The summary, trend, project groups, Recent runs, failure list, and flaky ranking on the execution page use the same filter scope; multiple selected dimensions restrict the data together. All means the dimension does not restrict.

### AC-03

Changing one filter keeps the other filters; switching Dashboard tabs keeps the filter state. A late response to an earlier filter request must not overwrite the result of the latest selection.

### AC-04

API days accepts 1–180, but the UI still has only four preset options. Do not infer from the API range that the UI supports custom date input.

### AC-05

The dimension filtering in this Story is guaranteed only for execution data; the scope of AI data is defined by QAD-107 and QAD-108, and its application dimension must not be assumed to work just because it shares the filter row.

## Related Stories

QAD-102, QAD-103, QAD-107, QAD-108

## Sources

- qa-dashboard/apps/web/src/App.tsx
- qa-dashboard/apps/web/src/components/FilterRow.tsx
- qa-dashboard/apps/api/src/qa_dashboard/metrics/filters.py
- qa-dashboard/apps/api/src/qa_dashboard/routes/dependencies.py
