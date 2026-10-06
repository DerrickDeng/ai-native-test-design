# QAD-106 — People sign-in and report read access

Simulated requirement: not a Jira export and not a real historical requirement; contains no company material.

- Snapshot date: 2026-09-28
- Type: requirement draft written from the current local QA Dashboard code and docs.
- Effective in environment: unknown; the date does not prove deployment.

## User Story

As a Dashboard user, I want to read test information only after signing in, and be able to end my session.

## Entry point

Local QA Dashboard; people start from the sign-in page, and data is pushed through the local API.

## Acceptance Criteria

### AC-01

Opening the Dashboard while signed out shows Sign in. After a successful sign-in with a valid local account, the Dashboard is shown with Test execution as the initial tab.

### AC-02

An ordinary sign-in failure for an unknown username, a wrong password, or a disabled account always shows Username or password is incorrect.. The rate-limit lockout message is a separate branch and does not need the same text.

### AC-03

Clicking Sign out returns to the sign-in page; the people Dashboard API, run details, and /reports/... all require a valid session, while /health does not require sign-in.

### AC-04

A password reset or account disable invalidates existing sessions. When a later request from a signed-in page receives 401, it returns to the sign-in page and shows Your session has ended. Sign in again to continue..

### AC-05

There is no self-service registration or password reset UI; accounts are maintained by local admin commands. A people session cannot replace the QAD-104 ingest token.

## Related Stories

QAD-104, QAD-105

## Sources

- qa-dashboard/apps/web/src/App.tsx
- qa-dashboard/apps/web/src/pages/LoginPage.tsx
- qa-dashboard/apps/api/src/qa_dashboard/routes/session.py
- qa-dashboard/apps/api/src/qa_dashboard/routes/dependencies.py
