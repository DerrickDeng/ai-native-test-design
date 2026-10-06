# QAD-108 Coverage Trace

## Related Stories

| Story | Relation | Handling |
|---|---|---|
| QAD-101 | Shared rule | Read the formatted requirement and note.md; QAD-101 feature (present when re-checked) has no AI-statistics scenario, so there is no overlap. QAD-101 owns filter defaults, options and execution-data filtering. QAD-101 AC-05 leaves AI scope to QAD-107 and QAD-108. This Story adds only that accuracy follows the date window (scenario 08). It adds no Application, Region or Environment assertion, as its AC-05 says. |
| QAD-107 | Interaction | Read the formatted requirement, its note.md and testcases/QAD-107.feature. QAD-107 owns adoption formulas, the empty-log rule and the dimension non-participation rule (its A14, scenario 07). This Story adds accuracy formulas and the missing-comparison behavior. Adoption is asserted only once (scenario 06), to show a log without comparison still contributes adoption, as QAD-108 AC-03 states. Scenario 03 uses accepted items only as data for "not derived from accepted". |

## Atoms

| Atom | Source | Quote | Disposition | Ref |
|---|---|---|---|---|
| A01 | AC-01 | precision = matched/(matched+extra) | Covered | |
| A02 | AC-01 | recall = matched/golden_total | Covered | |
| A03 | AC-01 | sum the counts first and then calculate | Covered | |
| A04 | AC-01 | do not derive matched from accepted | Covered | |
| A05 | AC-02 | F1 = 2*precision*recall/(precision+recall) | Covered | |
| A06 | AC-02 | when either component cannot be calculated | Covered | |
| A07 | AC-02 | or their sum is zero, F1 shows — | Covered | |
| A08 | AC-03 | A log without comparison does not contribute to the accuracy numerator or denominator | Covered | |
| A09 | AC-03 | but can still contribute QAD-107 adoption data | Covered | |
| A10 | AC-03 | When no Golden comparison can be calculated, the related accuracy shows — | Covered | |
| A11 | AC-03 | must not be faked as 0% | Covered | |
| A12 | AC-04 | The AI page shows Accuracy (F1) together with Precision and Recall | Covered | |
| A13 | AC-04 | grouped by agent, model, and prompt version | Question | Q1 |
| A14 | AC-04 | it keeps an evidence meaning different from adoption | Not testable | A semantic requirement with no separate observable result; calculating it apart from adoption is shown by the A04 assertions |
| A15 | AC-05 | Current statistics are filtered only by the date window | Covered | |
| A16 | AC-05 | do not add AI dimension assertions just because QAD-101 has Application/Region/Environment controls | Owned elsewhere | QAD-107 |
| A17 | AC-02 | When both precision and recall can be calculated and their sum is above zero | Covered | |
| A18 | AC-02 | In the current implementation, when either component cannot be calculated | Question | Q2 |

## Assertions

| Then | Atom | Type | Basis |
|---|---|---|---|
| 01.1 | A01 | Derived | matched=3，extra=1，3/(3+1)=75%。 |
| 01.1 | A12 | Stated | |
| 01.2 | A02 | Derived | matched=3，golden_total=6，3/6=50%。 |
| 01.2 | A12 | Stated | |
| 01.3 | A05 | Derived | precision=0.75, recall=0.5, sum 1.25 is above zero, F1=2*0.75*0.5/1.25=0.6=60%. |
| 01.3 | A17 | Derived | Both components can be calculated (denominators 4 and 6 are non-zero) and their sum 1.25 is above zero, so the formula applies. |
| 01.3 | A12 | Stated | |
| 02.1 | A03 | Derived | Summed matched=1+1=2, extra=0+2=2, 2/(2+2)=50%; the average of per-run precision would be (100%+33.3%)/2=66.7%, which differs. |
| 02.1 | A01 | Derived | precision = matched/(matched+extra) = 2/4。 |
| 02.2 | A03 | Derived | Summed golden_total=1+3=4, 2/4=50%; the average of per-run recall would be (100%+33.3%)/2=66.7%, which differs. |
| 02.2 | A02 | Derived | recall = matched/golden_total = 2/4。 |
| 02.3 | A03 | Derived | After summing, precision=0.5, recall=0.5, F1=2*0.5*0.5/1=0.5=50%; log B alone has precision and recall of 1/3 and F1=1/3, and the average of per-run F1 would be (100%+33.3%)/2=66.7%, which differs from 50%. |
| 03.1 | A04 | Derived | matched takes 3 from the comparison, precision=3/(3+1)=75%; if matched were derived as 4 from the 4 accepted items, precision would be 4/(4+1)=80%. |
| 03.2 | A04 | Derived | recall=3/4=75%; if matched were derived as 4 from accepted, recall would be 4/4=100%. |
| 03.3 | A04 | Derived | precision=0.75，recall=0.75，F1=2*0.75*0.75/(0.75+0.75)=0.75=75%。 |
| 04.1 | A01 | Derived | matched=0，extra=2，0/(0+2)=0%。 |
| 04.2 | A02 | Derived | matched=0，golden_total=2，0/2=0%。 |
| 04.3 | A07 | Stated | |
| 05.1 | A06 | Stated | |
| 06.1 | A10 | Derived | The only log has no comparison, so no Golden comparison can be calculated and the related accuracy shows —. |
| 06.1 | A11 | Stated | |
| 06.2 | A09 | Derived | The log has no comparison but still contributes adoption data: accepted=2, generated=2, 2/2=100% (formula from QAD-107 AC-02). |
| 07.1 | A08 | Derived | Only log A contributes: matched=1, extra=3, 1/(1+3)=25%; log B has no comparison and contributes nothing to the numerator or denominator. |
| 07.2 | A08 | Derived | Only log A contributes: matched=1, golden_total=4, 1/4=25%. |
| 07.3 | A08 | Derived | precision=0.25，recall=0.25，F1=2*0.25*0.25/(0.25+0.25)=0.25=25%。 |
| 08.1 | A15 | Derived | Last 7 days contains only log A from 3 days ago: 1/(1+0)=100%; log B from 20 days ago is outside the window. |
| 08.2 | A15 | Derived | Last 7 days contains only log A: 1/1=100%. |
| 08.3 | A15 | Derived | precision=1，recall=1，F1=2*1*1/2=1=100%。 |
| 08.4 | A15 | Derived | Last 30 days contains A and B: summed matched=2, extra=2, 2/(2+2)=50%. |
| 08.5 | A15 | Derived | Last 30 days contains A and B: summed matched=2, golden_total=4, 2/4=50%. |
| 08.6 | A15 | Derived | After summing, precision=0.5, recall=0.5, F1=0.5=50%. |
