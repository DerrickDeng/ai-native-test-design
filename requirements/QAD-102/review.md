# Review of testcases/QAD-102.feature

## Step 1: Independently checkable claims

AC-01
- C1: passed, failed, flaky and skipped are counted independently.
- C2: flaky means the first execution failed and the retry passed.
- C3: flaky does not increase the raw Passed count.
- C4: flaky counts in the pass-rate numerator.

AC-02
- C5: execution count = total - skipped.
- C6: pass rate = (passed + flaky) / execution count.
- C7: the daily trend uses the same formula.
- C8: the project grouping uses the same formula.
- C9: skipped is not in the denominator (checked for trend and project grouping as well as summary).

AC-03
- C10: the summary card uses the latest date with data inside the current QAD-101 filter scope.
- C11: the summary is not one pass rate merged over the whole date window.
- C12: the comparison baseline is the previous date with data in that scope, not necessarily the previous calendar day.

AC-04
- C13: execution count of zero shows "—", not 0% or 100%.
- C14: no data in range shows "—", not 0% or 100%.
- C15: with no previous-day data, no pass-rate change value is shown.

AC-05
- C16: each Recent runs row uses that run's own counts.
- C17: the difference between this-run flaky and the QAD-103 score is owned by QAD-103, so it is not in scope here.

## Step 2: Claim to proof

| Claim | Proof | Result |
|---|---|---|
| C1, C2, C3 | 01 | proven (but see Weak below) |
| C4, C5, C6 | 02 | proven for the summary, weak for the numerator (see Weak) |
| C7 | 03 | proven for the denominator, weak for the numerator |
| C8, C9 (project grouping) | 04 | proven |
| C10 (date-window part) | 05 | proven |
| C11 | 05 | proven |
| C13 | 07 | proven |
| C14 | 08 | proven |
| C15 | 06 | proven |
| C16 | 09 | proven |
| C12 | none | Missing, but already blocked by note.md Q2 |

**Missing**

- **Missing, C12 (known, blocked).**
  - Quote: "The comparison baseline is the previous date with data in that scope, which is not guaranteed to be the previous calendar day."
  - No scenario has a previous in-range data date. Q2 records that the change value has no formula or format, so this is an accepted gap.
  - No new scenario is asked for unless Q2 is answered.

- **Missing, C10 (filter part).**
  - Quote: "The summary card uses the latest date with data within the current QAD-101 filter scope"
  - Scenario 05 only varies the date window. No scenario has a newer run that a non-"All" Application, Region or Environment filter excludes.
  - The QAD-102 rule is that the card picks the latest date inside the filtered scope. Example: Application "Web" selected, and the newest run is Mobile.
  - Without this scenario, a card that picks the latest date before filtering would pass all nine scenarios.
  - QAD-101 scenarios 04 and 05 check filtered Passed and Failed counts. They do not check which date the pass-rate card picks.

- **Missing, multiple runs on the latest date.**
  - Quote: "the latest date with data"
  - The card works on a date. No scenario has two runs on the latest date with the summary checked.
  - Scenario 09 has two runs on one day but only asserts the Recent runs rows.
  - It is not stated whether the summary adds up the runs of that date. Confirm this in note.md before adding a scenario.

## Step 3: Then to source

**Unsupported**

- None found. Every Then maps to AC-01 through AC-05.

**Guessed**

- **Guessed, scenarios 02, 03, 04, 05, 06, 09 (percentage format).**
  - Quote: "the summary pass rate should be \"80%\""
  - The requirement never gives the display format. The text does not say whether it is "80%" or "80.0%".
  - Note.md Q3 records this and uses integer-result data. It is an accepted assumption.

- **Guessed, scenario 05.**
  - Quote: "the summary pass rate should not be the \"77.8%\" merged from 3 days ago and 1 day ago"
  - This assumes a one-decimal display. Under integer display, the merged bug would show "78%", so this negative assertion could not fail.
  - The positive "80%" assertion already catches the merged bug. This Then adds nothing and depends on an unwritten format.

- **Guessed, scenario 01 (where the counts appear).**
  - Quote: "the summary Passed should be 6"
  - The text does not say where the four counts are shown. The feature assumes they are in the summary. Q3 records this.

## Step 4: Duplicate

- **Duplicate, scenarios 02 and 06.**
  - Quote: "Then the summary pass rate should be \"80%\"" (02) and "Then the summary should show pass rate \"80%\" and no pass-rate change" (06)
  - Both use the same run-A and the same summary rate. A wrong rate fails both.
  - Scenario 06 adds the no-change-value check. Scenario 02 is only distinguishable from it when the rate is right and the change value appears.
  - This is low severity. Scenario 05 also repeats the 80% check but adds the merge check.
  - Optional fix: let 06 assert only the change-value absence.

## Step 5: CrossStory

- **CrossStory, scenario 04 (ambiguous state against QAD-104).**
  - Quote: "| run-C  | 1 day ago | chromium |" and "| run-C  | 1 day ago | firefox  |"
  - The same run id appears in two rows.
  - QAD-104 AC-03 says "Pushing the same report again replaces the records of the same run".
  - If the two rows are pushed as two reports with the same run id, the second replaces the first, and the Given cannot be built.
  - The Given should say that run-C is one report containing both projects, or use different run ids.

- **CrossStory, retesting QAD-101 rules.**
  - None found. Scenarios 06 and 08 use the date range only as a state to create an empty or baseline-less summary.
  - The QAD-101 rules are not retested (no filter default, dropdown, or late-response check).

- **CrossStory, QAD-103.**
  - None found. Scenario 01 defines flaky only through the Given.
  - The QAD-103 score is not tested, and there is no conflict.

- **CrossStory, states QAD-101 or QAD-104 does not create.**
  - None found. Scenarios 01 to 09 use the default "Last 14 days" and "All" filters, which QAD-101 defines.
  - The pushed counts are per-run tables. This is consistent with QAD-104 ingest, which keeps status and retries.

## Step 6: Weak

- **Weak, scenarios 02, 03, 05, 06, 09 (numerator not pinned).**
  - Quote: "| run-A  | 1 day ago | chromium | 6      | 2      | 2     | 5       |" (also run-B and run-R1 rows with failed 2, flaky 2)
  - Every run in these scenarios has failed equal to flaky (2 and 2).
  - The formula "(passed + flaky) / executed" gives 8/10. The wrong formula "(passed + failed) / executed" also gives 8/10, and the test cannot tell them apart.
  - Only scenario 04 (chromium 4/5/1, firefox 2/0/2) can tell them apart.
  - This is the important finding: the summary, trend and Recent runs rows never verify that flaky (and not failed) goes into the numerator.
  - Fix: use different failed and flaky values in the summary, trend and Recent runs data.

- **Weak, scenario 01 (failed and flaky both 2).**
  - Quote: "the summary Flaky should be 2" and "the summary Failed should be 2 and Skipped should be 5"
  - Flaky and Failed are both 2. A swap of the two cards, or Failed also counting flaky tests that were rerun, is not detected.
  - This also weakens C1 (independent counts). Use different values.

## Class summary

- Missing: three findings (C12 known and blocked, filter-scope latest date, multiple runs on one date).
- Unsupported: none.
- Guessed: three findings (format, "77.8%", count location), all except the "77.8%" one already recorded in Q3.
- Duplicate: one low-severity finding.
- CrossStory: one finding (scenario 04 run-C).
- Weak: two findings, one important (failed = flaky = 2).
