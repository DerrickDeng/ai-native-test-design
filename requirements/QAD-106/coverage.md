# QAD-106 Coverage Trace

## Related Stories

| Story | Relation | Handling |
|---|---|---|
| QAD-104 | Shared rule | Read the requirement, note.md, and QAD-104.feature. QAD-104 AC-05 defines the bearer ingest token rule, and QAD-104 scenario 07 already covers "a browser session alone is not enough". QAD-106 AC-05 repeats this sentence; this Story marks it Owned elsewhere, does not retest it, and records the duplicate definition in note.md Q1. |
| QAD-105 | Shared rule | Read the requirement, note.md, and QAD-105.feature. QAD-105 owns how run details are displayed. QAD-105 AC-04 says access requires this Story's people session, so "run details require a valid session" is owned by this Story. Scenario 05 only asserts that access is refused without a session, and does not assert what the details page shows. |

## Atoms

| Atom | Source | Quote | Disposition | Ref |
|---|---|---|---|---|
| A01 | AC-01 | Opening the Dashboard while signed out shows Sign in | Covered | |
| A02 | AC-01 | After a successful sign-in with a valid local account, the Dashboard is shown | Covered | |
| A03 | AC-01 | with Test execution as the initial tab | Covered | |
| A04 | AC-02 | an unknown username | Covered | |
| A05 | AC-02 | a wrong password | Covered | |
| A06 | AC-02 | or a disabled account | Covered | |
| A07 | AC-02 | always shows Username or password is incorrect. | Covered | |
| A08 | AC-02 | The rate-limit lockout message is a separate branch and does not need the same text | Not testable | Limiting clause; no trigger condition or text is given, so there is no observable expected result (see note.md Q4) |
| A09 | AC-03 | Clicking Sign out returns to the sign-in page | Covered | |
| A10 | AC-03 | the people Dashboard API | Covered | |
| A11 | AC-03 | run details | Covered | |
| A12 | AC-03 | /reports/... | Covered | |
| A13 | AC-03 | /health does not require sign-in | Covered | |
| A14 | AC-04 | A password reset | Covered | |
| A15 | AC-04 | or account disable invalidates existing sessions | Covered | |
| A16 | AC-04 | When a later request from a signed-in page receives 401, it returns to the sign-in page | Covered | |
| A17 | AC-04 | shows Your session has ended. Sign in again to continue. | Covered | |
| A18 | AC-05 | There is no self-service registration | Covered | |
| A19 | AC-05 | or password reset UI | Covered | |
| A20 | AC-05 | accounts are maintained by local admin commands | Not testable | No observable result in the Dashboard; the local admin command is only used to set up data for scenario 07 |
| A21 | AC-05 | A people session cannot replace the QAD-104 ingest token | Owned elsewhere | QAD-104 |

## Assertions

| Then | Atom | Type | Basis |
|---|---|---|---|
| 01.1 | A01 | Stated | |
| 02.1 | A02 | Stated | |
| 02.2 | A03 | Stated | |
| 03.1 | A04 | Stated | |
| 03.1 | A05 | Stated | |
| 03.1 | A06 | Stated | |
| 03.1 | A07 | Stated | |
| 04.1 | A09 | Stated | |
| 05.1 | A10 | Derived | The rule requires a valid session for the Dashboard API; the person has none, so access is refused and no test information is returned. |
| 05.1 | A11 | Derived | The rule requires a valid session for run details; the person has none, so access is refused and no test information is returned. |
| 05.1 | A12 | Derived | The rule requires a valid session for /reports/...; the person has none, so access is refused and no test information is returned. |
| 06.1 | A13 | Stated | |
| 07.1 | A14 | Derived | A password reset invalidates existing sessions, so the next request receives 401, and the rule says the page then returns to the sign-in page. |
| 07.1 | A15 | Derived | An account disable invalidates existing sessions, so the next request receives 401, and the rule says the page then returns to the sign-in page. |
| 07.1 | A16 | Stated | |
| 07.2 | A17 | Stated | |
| 08.1 | A18 | Stated | |
| 08.2 | A19 | Stated | |
