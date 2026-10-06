---
type: concept
title: People sessions and ingest authorization
description: Authentication, session invalidation, protected-read, and bearer-token rules for the Local QA Dashboard.
tags: [authentication, authorization, sessions, ingestion, bdd]
---

# People sessions and ingest authorization

The Dashboard separates people read access from report ingestion authorization. A browser session permits protected reading; it never substitutes for the bearer ingest token.

## Explicit rules

- A signed-out Dashboard shows Sign in. Valid local sign-in shows the Dashboard with Test execution as the initial tab. [QAD-106](viking://resources/qa-dashboard-sources/QAD-106/QAD-106-2026-09-28-formatted.md)
- Unknown username, wrong password, and disabled account use `Username or password is incorrect.`; rate-limit lockout is a separate message branch. Sign out returns to sign-in. [QAD-106](viking://resources/qa-dashboard-sources/QAD-106/QAD-106-2026-09-28-formatted.md)
- Dashboard people APIs, run details, and `/reports/...` require a valid session; `/health` does not. Password reset or account disable invalidates existing sessions. A later `401` from a signed-in page returns to sign-in and shows `Your session has ended. Sign in again to continue.` [QAD-106](viking://resources/qa-dashboard-sources/QAD-106/QAD-106-2026-09-28-formatted.md)
- There is no self-service registration or password-reset UI; local admin commands maintain accounts. [QAD-106](viking://resources/qa-dashboard-sources/QAD-106/QAD-106-2026-09-28-formatted.md)
- API report pushes require a bearer ingest token, and a browser session alone is insufficient. [QAD-104](viking://resources/qa-dashboard-sources/QAD-104/QAD-104-2026-09-28-formatted.md)

## BDD test implications

Separate browser-session examples from API-token examples. Exercise the ordinary invalid-credential cases as a shared-message outline, keep lockout separate, and assert both the expired-session redirect/message and the `/health` exception. Use a session-only push attempt to establish it cannot authorize ingestion.

**Inference:** report-review access tests should use a valid people session because review is stated to require one, while ingestion setup should use the ingest token. This is a test-fixture boundary derived from [QAD-104](viking://resources/qa-dashboard-sources/QAD-104/QAD-104-2026-09-28-formatted.md) and [QAD-106](viking://resources/qa-dashboard-sources/QAD-106/QAD-106-2026-09-28-formatted.md).

## Open questions

No unresolved authentication or authorization question is recorded in the supplied notes. The simulated drafts do not establish deployment or production behavior.

## Sources

- [QAD-104 — Report ingestion and data identity](viking://resources/qa-dashboard-sources/QAD-104/QAD-104-2026-09-28-formatted.md)
- [QAD-106 — People sign-in and report read access](viking://resources/qa-dashboard-sources/QAD-106/QAD-106-2026-09-28-formatted.md)