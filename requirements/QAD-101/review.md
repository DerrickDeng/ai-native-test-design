## Independent review of testcases/QAD-101.feature

I read the requirement, QAD-101 note.md, the related Story snapshots and notes (QAD-102, 103, 107, 108), and the QAD-107 feature. Only QAD-101.feature and QAD-107.feature exist in testcases/. I did not read coverage.md or review.md.

### Step 1. Claims and proof

| # | Claim (from requirement) | Proving scenario | Status |
|---|---|---|---|
| a | "the date defaults to Last 14 days" | S01 | Proven |
| b | "Application, Region, and Environment default to All" | S01 | Proven |
| c | "The date dropdown offers only Last 7 days, Last 14 days, Last 30 days, and Last 90 days" | S02 | Proven |
| d | Date selection limits execution data to that window (implied by "the same filter scope") | S03 | Proven, but only for Recent runs |
| e | "The summary, trend, project groups, Recent runs, failure list, and flaky ranking on the execution page use the same filter scope", tested for the Application dimension | S04 | Proven for all six blocks |
| f | The same six blocks follow the date dimension | none | Missing |
| g | The same six blocks follow Region and Environment | none | Missing |
| h | "multiple selected dimensions restrict the data together" | S05 | Proven for Recent runs only |
| i | "All means the dimension does not restrict" | S06 | Proven for Application only |
| j | "Changing one filter keeps the other filters" | S07 | Proven for one change (Environment) |
| k | "switching Dashboard tabs keeps the filter state" | S08 | Proven for the AI tab only, which note Q2 records |
| l | "A late response to an earlier filter request must not overwrite the result of the latest selection" | S09 | Proven |
| m | "API days accepts 1–180" | S10 | Proven for the boundaries 1 and 180 only |
| n | "the UI still has only four preset options. Do not infer from the API range that the UI supports custom date input" | S02, second Then | Proven |
| o | "the scope of AI data is defined by QAD-107 and QAD-108" | Not asserted in this feature | Correct: this rule belongs to another Story |

### Step 2. Missing

- **Missing, claim f (date on non-Recent-runs blocks).** Related scenario: S03.
  - Source: "The summary, trend, project groups, Recent runs, failure list, and flaky ranking on the execution page use the same filter scope".
  - S03 only asserts "Recent runs should list only ...".
  - A date filter that skips the summary, trend, project groups, failure list or flaky ranking would still pass.
  - S04 proves the six blocks only for Application.
  - The S03 data (one run per date) would need a failed or passed result per run to make the other blocks distinguishable.
- **Missing, claim g (Region and Environment on non-Recent-runs blocks).** Related scenarios: S04, S05.
  - Source: "multiple selected dimensions restrict the data together".
  - S05 only asserts "Recent runs should list only run-W1".
  - Region and Environment are never checked against summary, trend, project groups, failure list or flaky ranking.
- No other claim lacks a proof. The AC-05 and QAD-107/108 items are owned elsewhere, so they are not Missing.

### Step 3. Unsupported and Guessed

- **Guessed, S04, last two Thens.**
  - Source: "failure list, and flaky ranking on the execution page use the same filter scope".
  - The Thens say "the failure list should contain test \"sign in\"" and "the flaky ranking should contain test \"sign in\"".
  - The requirement never says how a test is displayed. The Given uses "auth.spec.ts > sign in", so the title-only display "sign in" is a choice.
  - This matters because a UI that shows the full path or a different label would fail for the wrong reason.
- **Guessed, S04, first Then.**
  - Source: none in QAD-101 for "the summary should show Passed 0 and Failed 1".
  - The value is right only through QAD-102 AC-03: "The summary card uses the latest date with data within the current QAD-101 filter scope".
  - Under Web the latest day (2 days ago) has one failed run, so the result is 0 and 1.
  - The QAD-101 text alone does not choose this rule. The feature does not cite QAD-102 as its source.
- **Guessed, S04, trend Then.**
  - Source: none in QAD-101 for "the trend should contain data for 6, 4, and 2 days ago".
  - The requirement does not say the trend has one point per day. QAD-102 AC-02 only says "daily trend".
  - If the trend is bucketed differently, this Then fails for a reason unrelated to filtering.
- **Guessed, S10.**
  - Source: "API days accepts 1–180".
  - The When says "the execution data endpoint of the Dashboard API". The requirement names no endpoint, and note Q3 admits this.
  - The Then "the API should accept the request" has no observable result defined either.
  - The scenario is unfalsifiable until the endpoint and result are known.
  - The Given "at least one run has been pushed" is also not in the text.
- **Unsupported.** None. Every other Then traces to requirement text.

### Step 4. Duplicate

None material.
- S05's final Recent runs result (only run-W1) is the same as S07's second Then, on the same data. But S07's first Then (filters retained) and S05's multi-dimension trigger are distinct.
- S05 and S07 would both fail if AND logic broke. Only S07's first Then tells the two failures apart.

### Step 5. CrossStory

- **QAD-102, S04 summary Then.** It depends on QAD-102 AC-03 (latest date with data, not merged window) without stating it.
  - The test is valid: run-W3 is Web-only and is the latest run for Web.
  - It does not retest the rule, because it only asserts the filtered result.
  - If QAD-102 changes, S04 breaks.
  - The dependency is undocumented in the feature, which is fine by convention.
- **QAD-103, S04 flaky Then.** It uses a state QAD-103 does create.
  - Web sign in has failed, passed, failed, which is 3 observations with 2 flips.
  - Per AC-02 to AC-04 the score is 2/3, so it enters the ranking.
  - Mobile scan code would qualify under All, so its absence proves the filter.
  - No conflict. It does not use QAD-102's "flaky" retry-pass status.
- **QAD-107 and QAD-108.**
  - S08 goes to the AI page, but it only asserts after returning to the execution page.
  - This is consistent with QAD-107 AC-05 ("Application, Region, and Environment do not filter AgentRun") and QAD-108 AC-05.
  - QAD-107.feature S07 owns the "dimensions don't affect AI" assertion, and QAD-101 does not duplicate it.
- No conflicts or retests found.

### Step 6. Weak

- **Weak, S05.** Only "Recent runs should list only run-W1" is asserted.
  - Source: "multiple selected dimensions restrict the data together".
  - Recent runs is one of six blocks named in the same AC.
  - This is the same gap as Missing g.
- **Weak, S06.** Only "Recent runs should list run-W1, run-M1, run-W2, run-M2, run-W3" is asserted.
  - Source: "All means the dimension does not restrict".
  - The reset is only shown on Recent runs, and only for Application.
- **Weak, S08.** Only "Recent runs should list only run-W1, run-W3" is asserted after the round trip.
  - Source: "switching Dashboard tabs keeps the filter state".
  - It does not check that summary, trend or the other blocks are still filtered.
  - The filter controls do show the retained values, which covers most of the claim.
- **Weak, S01.** It asserts only the displayed control values.
  - Source: "the date defaults to Last 14 days".
  - It does not check that the data actually uses a 14-day window at first load.
  - This is low severity, because "defaults to" is primarily a displayed selection.

### Summary

| Class | Result |
|---|---|
| Missing | 2 (claims f and g) |
| Unsupported | none |
| Guessed | 4 (S04 display name, S04 summary values, S04 trend, S10 endpoint and result) |
| Duplicate | none material |
| CrossStory | none blocking; S04 depends on QAD-102 AC-03 and QAD-103 AC-02 to AC-04 |
| Weak | S05, S06, S08, S01 (low) |

The structural gap is that only S04 checks all six blocks, and only for Application. Every other filter scenario asserts Recent runs alone.
