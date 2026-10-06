# QAD-101 Coverage Trace

## Related Stories

| Story | Relation | Handling |
|---|---|---|
| QAD-102 | Interaction | Read QAD-102 formatted snapshot and note. QAD-102 owns the pass-rate formula and the summary rule "latest date with data" (AC-03). This Story adds only that the summary uses the shared filter scope. Scenario 04 shows Passed and Failed counts for an in-scope run and does not assert any pass rate. |
| QAD-103 | Interaction | Read QAD-103 formatted snapshot and note. QAD-103 owns the flaky score and ranking rules (AC-03, AC-04). This Story adds only that the ranking uses the shared scope. Scenario 04 asserts that an in-scope test is listed and an out-of-scope test is not. No score, order, or threshold is asserted here. |
| QAD-107 | Shared rule | Read QAD-107 formatted snapshot and note. QAD-107 owns the AI date-only scope (AC-05). No AI scenario is written here. |
| QAD-108 | Shared rule | Read QAD-108 formatted snapshot. QAD-108 AC-05 owns the AI date-only scope for Accuracy statistics. No AI scenario is written here. |

## Atoms

| Atom | Source | Quote | Disposition | Ref |
|---|---|---|---|---|
| A01 | AC-01 | the date defaults to Last 14 days | Covered | |
| A02 | AC-01 | Application, Region, and Environment default to All | Covered | |
| A03 | AC-01 | The date dropdown offers only Last 7 days, Last 14 days, Last 30 days, and Last 90 days | Covered | |
| A04 | User Story | filter execution data by date, application, region, and environment | Covered | |
| A05 | AC-02 | The summary, trend | Covered | |
| A06 | AC-02 | summary, trend, project groups | Covered | |
| A07 | AC-02 | project groups, Recent runs | Covered | |
| A08 | AC-02 | Recent runs, failure list | Covered | |
| A09 | AC-02 | failure list, and flaky ranking | Covered | |
| A10 | AC-02 | flaky ranking on the execution page use the same filter scope | Covered | |
| A11 | AC-02 | multiple selected dimensions restrict the data together | Covered | |
| A12 | AC-02 | All means the dimension does not restrict | Covered | |
| A13 | AC-03 | Changing one filter keeps the other filters | Covered | |
| A14 | AC-03 | switching Dashboard tabs keeps the filter state | Covered | |
| A15 | AC-03 | A late response to an earlier filter request must not overwrite the result of the latest selection | Covered | |
| A16 | AC-04 | API days accepts 1–180 | Covered | |
| A17 | AC-04 | the UI still has only four preset options | Covered | |
| A18 | AC-04 | Do not infer from the API range that the UI supports custom date input | Covered | |
| A19 | AC-05 | The dimension filtering in this Story is guaranteed only for execution data | Not testable | Scope limit, not a promise with an observable outcome |
| A20 | AC-05 | the scope of AI data is defined by QAD-107 and QAD-108 | Owned elsewhere | QAD-107 |
| A21 | AC-05 | its application dimension must not be assumed to work just because it shares the filter row | Owned elsewhere | QAD-108 |

## Assertions

| Then | Atom | Type | Basis |
|---|---|---|---|
| 01.1 | A01 | Stated | |
| 01.2 | A02 | Stated | |
| 02.1 | A03 | Stated | |
| 02.1 | A17 | Stated | |
| 02.2 | A18 | Stated | |
| 03.1 | A04 | Derived | Option "Last N days" limits runs to the last N days: 3, 10, 20, 40 days ago fall inside 7, 14, 30, 90 days as listed in the Examples rows, and outside the smaller windows. |
| 04.1 | A05 | Derived | In-scope runs are Web only; the latest Web date is 2 days ago (run-W3, failed), so Passed 0 and Failed 1 (QAD-102 AC-03 for the latest-date rule). Unfiltered latest date would be 1 day ago (run-M3, passed). |
| 04.2 | A06 | Derived | Web runs are on days 6, 4, 2 ago; Mobile runs on days 5, 3, 1 ago are out of scope. |
| 04.3 | A07 | Derived | Web run tests belong to project chromium; ios belongs to Mobile runs only. |
| 04.4 | A08 | Derived | Web runs are run-W1, run-W2, run-W3. |
| 04.5 | A09 | Derived | Test sign in failed in run-W1 and run-W3 (Web); test scan code failed only in run-M2 (Mobile, out of scope). |
| 04.6 | A10 | Derived | sign in history in Web scope: failed, passed, failed gives flips 2, flaky_runs 0, 3 valid records, score 2/3 above zero (QAD-103 AC-03, AC-04), so it is listed; scan code records are all Mobile and out of scope. |
| 05.1 | A11 | Derived | Intersection of Web, EU, staging keeps run-W1 only (run-W2 fails Region, run-W3 fails Environment, run-M1 fails Application). Latest date in scope is 6 days ago and run-W1 failed, so Passed 0 and Failed 1 (QAD-102 AC-03 for the latest-date rule). |
| 05.1 | A05 | Derived | Same basis as 05.1 above; the summary uses only run-W1. |
| 05.2 | A11 | Derived | Only run-W1 is in scope, on 6 days ago. |
| 05.2 | A06 | Derived | Same basis; trend has data only for run-W1's date. |
| 05.3 | A11 | Derived | run-W1 test belongs to chromium; ios belongs to Mobile runs, which fail Application. |
| 05.3 | A07 | Derived | Same basis; project groups follow run-W1 only. |
| 05.4 | A11 | Derived | run-W1 is the only run passing all three dimensions. |
| 05.4 | A08 | Derived | Same basis; Recent runs lists run-W1 only. |
| 05.5 | A11 | Derived | sign in failed in run-W1 (in scope); scan code failed only in run-M2, which is out of scope. |
| 05.5 | A09 | Derived | Same basis; failure list follows run-W1 only. |
| 05.6 | A11 | Derived | In scope sign in has 1 valid record, fewer than the 3 records needed to be scored (QAD-103 AC-02), and scan code has none in scope. Under Application Web alone sign in has 3 records and is listed. |
| 05.6 | A10 | Derived | Same basis; ranking follows run-W1 only. |
| 06.1 | A12 | Derived | Application "All" does not restrict, and other dimensions are "All", so all five runs match. |
| 07.1 | A13 | Stated | |
| 07.2 | A13 | Derived | Web, EU, staging keeps only run-W1. |
| 08.1 | A14 | Stated | |
| 08.2 | A14 | Derived | Web and EU with Environment All keep run-W1 and run-W3. |
| 09.1 | A15 | Stated | |
| 09.2 | A15 | Derived | Latest selection is Web; Web runs are run-W1, run-W2, run-W3. If the late Mobile response overwrote the result, Mobile runs would appear. |
| 10.1 | A16 | Stated | |
| 11.1 | A04 | Derived | Last 7 days keeps only run-D3 (3 days ago); 10 and 20 days ago are older than 7 days. |
| 11.1 | A06 | Derived | Same basis; trend has data only for 3 days ago. |
| 11.2 | A04 | Derived | firefox appears only in run-D10, which is outside Last 7 days. |
| 11.2 | A07 | Derived | Same basis; project groups follow run-D3 only. |
| 11.3 | A04 | Derived | pay failed only in run-D10, outside Last 7 days; sign in failed in run-D3. |
| 11.3 | A09 | Derived | Same basis; failure list follows run-D3 only. |
| 11.4 | A04 | Derived | Under Last 30 days sign in has 3 records (failed, passed, failed) and is ranked (QAD-103 AC-02 to AC-04). Under Last 7 days only run-D3 remains, 1 record, so it is not ranked. |
| 11.4 | A10 | Derived | Same basis; ranking follows run-D3 only. |
