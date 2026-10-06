# QAD-106 Independent Review

Reviewer output, saved as returned by a fresh subagent (read-only, no access to coverage.md).

REVIEW of testcases/QAD-106.feature

STEP 1 - Claims from the requirement, and the proof for each

AC-01
- C1: "Opening the Dashboard while signed out shows Sign in". Proved by scenario 01.
- C2: "After a successful sign-in with a valid local account, the Dashboard is shown". Proved by scenario 02, Then 1.
- C3: "with Test execution as the initial tab". Proved by scenario 02, Then 2.

AC-02
- C4: An unknown username gets "Username or password is incorrect." Proved by scenario 03, row 1.
- C5: A wrong password gets the same prompt. Proved by scenario 03, row 2.
- C6: A disabled account gets the same prompt. Proved by scenario 03, row 3.
- C7: "The rate-limit lockout message is a separate branch and does not need the same text". This is a negative statement about wording, so it needs no test. But the rate-limit lockout branch itself has no scenario and no trigger rule (see Missing 1).

AC-03
- C8: "Clicking Sign out returns to the sign-in page". Proved by scenario 04.
- C9: The staff Dashboard API requires a valid session. Proved by scenario 05, row 1.
- C10: The run detail requires a valid session. Proved by scenario 05, row 2.
- C11: "/reports/..." requires a valid session. Proved by scenario 05, row 3.
- C12: "/health does not require sign-in". Proved by scenario 06.
- C13: After sign-out, the old session can no longer read data. See Missing 2.

AC-04
- C14: A password reset invalidates the existing session. Proved by scenario 07, row 1.
- C15: Disabling the account invalidates the existing session. Proved by scenario 07, row 2.
- C16: "When a later request from a signed-in page receives 401, it returns to the sign-in page". Proved by scenario 07, Then 1.
- C17: The prompt is "Your session has ended. Sign in again to continue." Proved by scenario 07, Then 2.

AC-05
- C18: "There is no self-service registration ... UI". Proved by scenario 08, Then 1.
- C19: "There is no ... password reset UI". Proved by scenario 08, Then 2.
- C20: "accounts are maintained by local admin commands". The setup uses admin commands in scenario 07. Nothing checks that this is the only way to maintain accounts, which is weak or untestable.
- C21: "A people session cannot replace the QAD-104 ingest token". Owned by QAD-104 scenario 07. Note.md Q1 records this. Not Missing here.

STEP 2 - Missing

1. Missing: rate-limit lockout branch (C7). Quote: "The rate-limit lockout message is a separate branch and does not need the same text." No scenario covers the lockout. The text gives no threshold and no lockout message, so this is blocked on missing information. note.md does not record it as an open question. Recommend adding it to note.md rather than adding a scenario. The important point is that a lockout must not be tested against the AC-02 message.
2. Missing (mild): after Sign out, the ended session can no longer read data. Quote: "Clicking Sign out returns to the sign-in page; the people Dashboard API, run details, and /reports/... all require a valid session". "End my session" is in the User Story ("and be able to end my session"). Scenario 04 only asserts that the login page appears. It never shows the old session is dead, for example by going back or reopening a run or /reports/ URL after sign-out. The text does not say outright that sign-out invalidates the session, so this is a judgment call. It should at least be an open question.
3. Missing (mild): In AC-04, "account disable" also implies that a disabled account cannot log in. Scenario 03 row 3 covers this. No gap.
4. Missing (mild): In AC-04, the session ends when the reset or disable happens. Scenario 07 proves this only after the next request. That matches the text ("a later request ... receives 401").

STEP 3 - Unsupported and Guessed

- Guessed, scenario 05 Then: "the access should be refused and no test information should be returned". The text says only "all require a valid session". It gives no status code or form of rejection. note.md Q2 records this as open and non-blocking. "no test information should be returned" is supported by the User Story ("read test information only after signing in"). The status code is not asserted, so this is not Guessed in the strict sense. The Then is weak but honest.
- Guessed, scenario 05, Given: "the person has no valid people session" is ambiguous. It could mean never logged in, expired, or signed out. One reading is enough for the claim, so this is minor.
- Guessed, scenario 03 Given, third example row: "the correct password of the account". This is fine and follows the text ("a disabled account").
- Guessed, scenario 03 Given: "whose password is not 'wrong-password'". This is test setup, not a rule.
- Guessed, scenario 07 "the person triggers the next data request on the open Dashboard page". Q3 in note.md records this. Not blocking.
- Guessed, scenario 07 Then 1: "the page should return to the sign-in page" is supported by AC-04 ("returns to the sign-in page").
- Guessed, scenario 04 Then: "the page should return to the sign-in page" is supported by AC-03.
- Guessed, scenario 06 Then: "the access should succeed without requiring sign-in". The text gives no response body or status. Q2 records this.
- Unsupported: none found.

STEP 4 - Duplicate

- Scenario 01 and scenario 02 Given: the "sign-in page" state is the same, but they check different outcomes. Not duplicates.
- Scenario 05 rows 1 to 3 each test a different target. Not duplicates.
- Scenario 03 examples: each row fails on a different cause (user does not exist, password wrong, account disabled). Not duplicates.
- Scenario 07 rows 1 and 2: different triggers, same Then. Distinguished by the admin action. Not duplicates.
- No Duplicate findings.

STEP 5 - CrossStory

- QAD-104 owns "API pushes require a bearer ingest token; a browser session alone is not enough" (QAD-104 scenario 07). QAD-106 has no scenario for it. Correct, no retest.
- QAD-105 owns View report and the run detail content. QAD-106 scenarios 05 and 06 use "run-106-a" only as access targets and do not retest QAD-105 content. No conflict.
- QAD-105 and QAD-104 features log in with the setup "QA is signed in to the local QA Dashboard". This relies on QAD-106 scenario 02, which is fine.
- Scenario 05, Given "run 'run-106-a' and its report exist": the Given does not say how the run was created, in particular whether it has a bundle. Row 3 (/reports/...) needs a bundle, because the QAD-105 requirement says "With a bundle, the saved original HTML report is embedded". If run-106-a has no bundle, the /reports/... row has no target. QAD-105 creates the bundle state through a push with an HTML bundle. Row 3 therefore uses a state that this Story does not define. Quote: "the /reports/... report address of run \"run-106-a\"". Class: CrossStory (mild). The fix is to say in the Given that run-106-a was pushed with a bundle, following QAD-104 AC-04.
- Scenario 05 rows 2 and 3: "run details" is the QAD-105 page. This is fine. AC-03 in QAD-106 names it.
- QAD-105 AC-04 says access needs the QAD-106 session. QAD-106 scenario 05 owns that claim, and QAD-105 has no retest. Consistent.
- No conflicts found.

STEP 6 - Weak

- Scenario 05 Then: "the access should be refused and no test information should be returned". This is weaker than a specific rejection, but the text gives none. Q2 already records it. Weak (known, not blocking).
- Scenario 06 Then: "the access should succeed without requiring sign-in". The text gives no return content. Q2 records this. Weak (known).
- Scenario 02 Then 1: "the page should show the Dashboard". "Dashboard" is generic. The text gives no specific marker. Acceptable.
- Scenario 07: the Then checks that the login page appears and the prompt shows. It does not check that the old page no longer shows test data. This is a reasonable reading of AC-04 ("returns to the sign-in page").
- Scenario 07 Then 1: "the page should return to the sign-in page" is not weak.

SUMMARY BY CLASS

- Missing: 1 (rate-limit lockout, blocked on missing information, not in note.md); 1 mild (sign-out then old session reads data).
- Unsupported: none.
- Guessed: none confirmed. Two items are already recorded in note.md as open and non-blocking (Q2, Q3).
- Duplicate: none.
- CrossStory: 1 mild (scenario 05 row 3 needs a run with a bundle, and the Given does not define one).
- Weak: scenarios 05 and 06 Then, both recorded in note.md Q2.

---
## Author handling

- Missing 1 (rate-limit lockout): accepted in part. The atom stays Not testable because the clause states no observable result. Recorded the missing trigger and message as note.md Q4. No scenario written.
- Missing 2 (sign-out and old session): accepted as a question. The text does not say the old session ends at sign-out. Recorded as note.md Q5. Scenario 04 stays limited to returning to the login page.
- Missing 3, 4: no gap; the reviewer found scenarios 03 and 07 cover them.
- Guessed / Weak on scenarios 05 and 06 (no rejection form, no /health body): rejected as design changes. Asserting a status code or body would be a chosen result. Already recorded as note.md Q2.
- Guessed scenario 05 Given "no valid session" is ambiguous: rejected. The claim holds for any state without a valid session.
- Guessed scenario 07 trigger action: rejected. Already note.md Q3.
- CrossStory scenario 05 row 3 needs a run with a bundle: accepted. Given now says the run was pushed with an HTML bundle per QAD-104.
