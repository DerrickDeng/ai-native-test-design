REVIEW OF testcases/QAD-108.feature

Step 1. Checkable claims from QAD-108 (C1 to C13)
- C1 (AC-01): precision = matched/(matched+extra)
- C2 (AC-01): recall = matched/golden_total
- C3 (AC-01): counts are summed across logs first, then the ratio is computed
- C4 (AC-01): matched is not derived from accepted
- C5 (AC-02): when precision and recall are both computable and their sum is above 0, F1 = 2*P*R/(P+R)
- C6 (AC-02): when either component is not computable, F1 shows —
  - C6a: precision not computable, for example matched+extra = 0
  - C6b: recall not computable, for example golden_total = 0
- C7 (AC-02): when P+R = 0, F1 shows —
- C8 (AC-03): a log without comparison adds nothing to the accuracy numerator or denominator
- C9 (AC-03): a log without comparison still adds to QAD-107 adoption data (owned by QAD-107)
- C10 (AC-03): with no computable Golden comparison, the related accuracy shows —, not 0%
  - This covers logs without comparison. It also covers an empty window.
  - It may also cover Precision and Recall. The text says "the related accuracy".
- C11 (AC-04): the AI page shows Accuracy (F1) and also Precision and Recall
- C12 (AC-04): the data is grouped by agent, model and prompt version
- C13 (AC-04): the accuracy evidence is kept distinct from adoption
- C14 (AC-05): accuracy is filtered by the date window only. No AI dimension assertions are added.

Step 2. Claim to proof
- C1: 01 (75%), 04 (0/(0+2)). Covered.
- C2: 01 (50%), 04. Covered.
- C3: 02 and 08 (second phase). Covered.
- C4: 03. Covered.
- C5: 01, 02, 03, 07, 08. Covered.
- C6a: 05. Covered.
- C7: 04. Covered.
- C8: 07 (Precision and Recall from log A only). Covered.
- C9: 06 (Adoption 2/2). Covered. See CrossStory.
- C10: 06 covers the F1 part only.
- C11: covered in 01, 02, 03, 04, 07, 08. F1 is the only value shown in 05 and 06.
- C13: 06 (F1 — with Adoption 100%). Covered.
- C14: 08 (7 days vs 30 days). Covered.

Missing
1. Missing, C6b. No scenario. Scenarios 03 to 07 never use golden_total = 0.
   - Quote: "In the current implementation, when either component cannot be calculated or their sum is zero, F1 shows —"
   - Scenario 05 only makes precision non-computable (matched 0, extra 0, golden_total 2).
   - A defect that handles only the precision-undefined branch would go unnoticed. Recall-undefined with a computable precision is a separate case, for example matched 0, extra 2, golden_total 0.
   - Note the tension with Q2: the text does not say whether golden_total = 0 counts as "cannot be calculated". Confirm that first.
2. Missing, C10 (empty state). There is no scenario for a window with no logs, or with no comparison logs at all. Only "one log without comparison" is covered.
   - Quote: "When no Golden comparison can be calculated, the related accuracy shows — and must not be faked as 0%"
   - It matters because the empty-window path can show 0% while the path with a log passes.
   - A scenario with 0 logs would be independent of 06.
3. Missing, C10 (Precision and Recall in the no-comparison state). Scenarios 05 and 06 assert only F1. AC-03 says "the related accuracy shows —" and does not name F1.
   - Q2 records this as open and unresolved, so it is acknowledged. It is still a live gap if "the related accuracy" includes Precision and Recall.
4. Missing, C12. No scenario for grouping by agent, model and prompt version.
   - Quote: "grouped by agent, model, and prompt version"
   - Q1 acknowledges this, and the text really is ambiguous (each dimension, or the combination). It is a gap only as a recorded open item.

Step 3. Unsupported / Guessed
- Guessed, scenarios 01, 02, 03, 04, 06, 07, 08. Every Then asserts a percent such as "should show 75%".
  - The text gives only ratio formulas and does not say the display is a percent.
  - Quote: "precision = matched/(matched+extra)"
  - Q3 and 107 Q2 acknowledge this. The values are whole percents, but the percent choice is still made by the design.
- Guessed, scenario 05. It treats matched+extra = 0 as "cannot be calculated". AC-02 does not define when a component is non-computable.
  - Quote: "either component cannot be calculated"
  - It is a reasonable reading of the AC-01 formula, but it is an inference. Q2 only partly records it.
- Guessed, scenario 04. "Precision should show 0%" and "Recall should show 0%" assume a computable zero shows 0%. This follows from "must not be faked as 0%" only by inference, and the text contrasts it with "—" only for the missing-comparison case. Low risk.
- No other Then lacks source support. Scenarios 01 to 03 and 07 to 08 follow directly from the formulas.

Step 4. Duplicate
- None. 04 (P+R = 0) and 05 (a non-computable component) exercise different branches. 02 and 08 phase 2 use the same numbers, but 08 fails on the window and 02 on aggregation, so a failure can be told apart.

Step 5. CrossStory
- Scenario 06, "Adoption should show 100%, i.e. 2/2". This exercises QAD-107 AC-01 and AC-02 arithmetic. It is needed to prove the QAD-108 AC-03 claim ("can still contribute QAD-107 adoption data"), so it is acceptable. It also matches the state QAD-107 creates (items, accepted, no comparison). No action needed. The 2/2 breakdown is only an example and should not become a re-test of QAD-107 rules.
- Scenario 08 (date window) overlaps QAD-107 scenario 06 in style, but it asserts accuracy values, so it is not a retest.
- No conflicts with QAD-101 or QAD-107.
  - QAD-101 default of Last 14 days and the 7 and 30 day options are used as given.
  - QAD-101 AC-05 and QAD-107 AC-05 are respected: no dimension assertions were added, and QAD-107 scenario 07 owns them.
- Observation on the QAD-107 feature (outside the feature under review): its scenarios 03 and 05 assert F1 values (50% and 40%), which are QAD-108's formula. These are cross-owned assertions in the QAD-107 file, not a defect in QAD-108.
- Data realism in scenario 03: 4 generated items, but matched 1 + extra 1 = 2. The text does not relate generated to matched+extra. It is acceptable as evidence that matched comes from comparison, but the numbers are invented.

Step 6. Weak
- Scenarios 05 and 06 assert only Accuracy (F1). Precision and Recall are not asserted, though the AI page must show them (C11). Q2 acknowledges it.
- Scenario 03 asserts "Accuracy (F1) should show 50%" without the derivation. It is correct (0.5, 0.5 gives 0.5), and it is a mild weakness only.
- Scenarios 02, 03, 07 and 08 (second phase) all use P = R = 50%. In those scenarios a swapped or mis-assigned Precision and Recall formula would produce the same values. Only scenarios 01 (75/50), 04 and 08 phase 1 (100/100, same values) distinguish them, and 01 alone does so. Suggest asymmetric data for the aggregation scenario 02, for example a different extra count. This is a data-selection weakness, not a claim gap.

Summary of classes
- Missing: 4 findings (C6b recall-not-computable, empty window, Precision/Recall in no-comparison state, grouping)
- Unsupported: none
- Guessed: percent display, non-computable definition, 0% display for computable zeros
- Duplicate: none
- CrossStory: no conflicts; scenario 06 Adoption assertion acceptable
- Weak: F1-only assertions in 05 and 06; symmetric P=R data in 02, 03, 07
