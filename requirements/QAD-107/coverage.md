# QAD-107 Coverage Trace

## Related Stories

| Story | Relation | Handling |
|---|---|---|
| QAD-101 | Interaction | Read the formatted requirement and note.md; QAD-101 feature (present when re-checked) has no AI-statistics scenario, so there is no overlap. QAD-101 owns the date default, dropdown options and filter behavior on execution data. This Story adds only that AI statistics use the date window and ignore Application, Region and Environment (AC-05). Scenarios 06 and 07 assert only that addition. |
| QAD-108 | Interaction | Read the formatted requirement (no note.md). QAD-108 owns precision, recall and F1 rules. This Story uses comparison data only so that Accuracy (F1) has a value beside adoption (scenarios 03 and 05); the F1 values are derived from QAD-108 AC-01 and AC-02 and are not the point of the scenario. |

## Atoms

| Atom | Source | Quote | Disposition | Ref |
|---|---|---|---|---|
| A01 | AC-01 | generated is the number of generated items | Covered | |
| A02 | AC-01 | accepted is the number of items with accepted=true | Covered | |
| A03 | AC-01 | accepted_unchanged is the number of items with accepted=true and edited=false | Covered | |
| A04 | AC-02 | adoption = accepted/generated | Covered | |
| A05 | AC-02 | unchanged adoption = accepted_unchanged/generated | Covered | |
| A06 | AC-02 | Sum the counts first and then divide; do not simply average the per-run percentages | Covered | |
| A07 | AC-03 | A log with no items and no explicit generated does not contribute to the adoption numerator or denominator | Covered | |
| A08 | AC-03 | can still have cost, tokens, and a QAD-108 comparison | Question | Q3 |
| A09 | AC-03 | A zero denominator shows — | Covered | |
| A10 | AC-04 | The AI page shows Adoption, Unchanged adoption, and Accuracy (F1) together | Covered | |
| A11 | AC-04 | a high adoption does not prove high accuracy | Covered | |
| A12 | AC-04 | Evidence of correctness is defined by QAD-108 | Owned elsewhere | QAD-108 |
| A13 | AC-05 | Current AI statistics are filtered by the date window | Covered | |
| A14 | AC-05 | Application, Region, and Environment do not filter AgentRun | Covered | |
| A15 | AC-05 | This limit must be read together with the QAD-101 shared filter row | Not testable | A reading hint with no observable result of its own; the date and dimension behavior is asserted by A13 and A14 |
| A16 | note | no items but generated>0 increases the denominator | Question | Q1 |
| A17 | AC-01 | For normal logs with items human review records | Covered | |

## Assertions

| Then | Atom | Type | Basis |
|---|---|---|---|
| 01.1 | A01 | Derived | 5 generated items, so generated=5. |
| 01.1 | A02 | Derived | 2 accepted and unedited + 1 accepted and edited gives accepted=3; the two items with accepted=false are not counted. |
| 01.1 | A04 | Derived | adoption = 3/5 = 60%。 |
| 01.1 | A17 | Stated | |
| 01.2 | A03 | Derived | Only the 2 items with accepted=true and edited=false count, so accepted_unchanged=2; the 1 item with accepted=true and edited=true and the 1 item with accepted=false and edited=false do not count. |
| 01.2 | A05 | Derived | unchanged adoption = 2/5 = 40%。 |
| 02.1 | A06 | Derived | Summed accepted=1+1=2, generated=1+4=5, 2/5=40%; the average of per-run percentages would be (100%+25%)/2=62.5%, which differs. |
| 02.1 | A04 | Derived | adoption = accepted/generated = 2/5。 |
| 02.2 | A06 | Derived | Summed accepted_unchanged=1+0=1, generated=5, 1/5=20%; the average would be (100%+0%)/2=50%, which differs. |
| 02.2 | A05 | Derived | unchanged adoption = 1/5。 |
| 03.1 | A07 | Derived | The only log has no items and no explicit generated, so it contributes nothing to the numerator or denominator, and the denominator is 0. |
| 03.1 | A09 | Stated | |
| 03.2 | A07 | Derived | Same as 03.1; the denominator is 0. |
| 03.2 | A09 | Stated | |
| 03.3 | A10 | Derived | The log has no adoption data but still has a comparison (QAD-108 AC-03); by QAD-108 AC-01 and AC-02: precision=2/(2+2)=0.5, recall=2/4=0.5, F1=2*0.5*0.5/(0.5+0.5)=0.5. |
| 04.1 | A07 | Derived | Only log A contributes: accepted=2, generated=4, 2/4=50%; log B contributes nothing to the numerator or denominator. |
| 04.2 | A07 | Derived | Only log A contributes: accepted_unchanged=2, generated=4, 2/4=50%. |
| 05.1 | A10 | Stated | |
| 05.2 | A10 | Stated | |
| 05.3 | A10 | Derived | By QAD-108 AC-01 and AC-02: precision=1/(1+3)=0.25, recall=1/1=1, F1=2*0.25*1/(0.25+1)=0.4. |
| 05.3 | A11 | Derived | Adoption is 100% while F1 is 40%, which shows a high adoption and a low accuracy can occur together. |
| 06.1 | A13 | Derived | Last 7 days contains only log A from 3 days ago: accepted=2, generated=2, 2/2=100%; log B from 20 days ago is outside the window. |
| 06.2 | A13 | Derived | Last 7 days contains only log A: accepted_unchanged=2, generated=2, 2/2=100%. |
| 06.3 | A13 | Derived | Last 30 days contains A and B: accepted=2+0=2, generated=2+2=4, 2/4=50%. |
| 06.4 | A13 | Derived | Last 30 days contains A and B: accepted_unchanged=2+0=2, generated=4, 2/4=50%. |
| 07.1 | A14 | Stated | |
| 07.2 | A14 | Stated | |
