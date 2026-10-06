REVIEW OF testcases/QAD-107.feature (7 scenarios). Only QAD-107.feature exists in testcases/; QAD-101 and QAD-108 have no feature files. Read-only, nothing edited.

STEP 1-2. Claims and proof

- C1 (AC-01): generated = number of generated items. Proved by the denominators in S1, S2 and S4.
- C2 (AC-01): accepted counts items with accepted=true, whatever edited is. Proved by S1 (1 accepted+edited item counted; 1 rejected+edited item excluded, so the total is 3/5) and S2 (log B).
- C3 (AC-01): accepted_unchanged counts only accepted=true AND edited=false. Proved by S1 (2/5). A wrong rule such as "edited=false only" would give 3/5, and "accepted only" would also give 3/5, so both are caught.
- C4 (AC-02): adoption = accepted/generated. Proved by S1.
- C5 (AC-02): unchanged adoption = accepted_unchanged/generated. Proved by S1.
- C6 (AC-02): counts are summed first, not percentages averaged. Proved by S2 (40% vs 62.5%, 20% vs 50%).
- C7 (AC-03): a log with no items and no explicit generated adds nothing to numerator or denominator. Proved by S4. S3 also covers it for the only-such-log case.
- C8 (AC-03): such a log can still carry a comparison that shows. Proved by S3 (F1 50%).
- C9 (AC-03): such a log can still carry cost and token. NO scenario. See Missing 1.
- C10 (AC-03): zero denominator shows —. Proved by S3 for both metrics. See Missing 2 for the other zero-denominator state.
- C11 (AC-04): the AI page shows Adoption, Unchanged adoption and Accuracy (F1) together. Proved by S5.
- C12 (AC-04): high adoption does not prove accuracy. Proved by S5.
- C13 (AC-05): AI stats filter by date window. Proved by S6.
- C14 (AC-05): Application, Region and Environment do not filter AgentRun. Proved by S7.

Missing
1. C9, no scenario. Quote: "can still have cost, tokens, and a QAD-108 comparison". Why it matters: this AC-03 clause has no proof. Note.md Q3 records it as unobservable because AC gives no place to see cost or token, so this is a known gap, not a silent one.
2. Zero denominator with no logs in the window (low severity). Quote: "A zero denominator shows —". Why it matters: the text names the denominator-zero rule generally, and S3 covers only the "log without items or generated" trigger. An empty window is a separate zero-denominator state, and a UI could show 0% there and still pass S3.

STEP 3. Unsupported / Guessed
- Unsupported: none. Every Then value follows from AC formulas. S3 (50%) and S5 (40%) match QAD-108 AC-01/02. I checked the arithmetic: S3 gives precision 0.5, recall 0.5, F1 0.5. S5 gives precision 1/4, recall 1, F1 0.4.
- Guessed, S1-S7 (all Adoption / Unchanged adoption / Accuracy Thens). Quote: "adoption = accepted/generated". Why it matters: the text defines a ratio and never says it is shown as a percentage. The feature assumes "60%". Note.md Q2 records only the decimal-place question, not percent versus ratio.
- Guessed, S6. Quote: "Current AI statistics are filtered by the date window". Why it matters: the text does not say which log timestamp the window uses. "happened 3 days ago" assumes one. The 3-day and 20-day gaps are safely far from the 7-day and 30-day boundaries, so the risk is low.

STEP 4. Duplicate
None found. S3 and S4 overlap partly, because a wrongly counted no-items log would show 0% instead of — in S3. Only S4 catches a wrongly counted log next to real data, and only S3 catches a zero denominator, so both are kept.

STEP 5. CrossStory
- S7, related to QAD-101. Quote from the feature: "Given the "<dimension>" dropdown has options other than All". Why it matters: QAD-101 never defines where dropdown options come from. The feature also never says the log's application, region or environment differs from the selected option, so the "unchanged" result could pass trivially. Setting the state explicitly would fix this.
- S3, related to QAD-108. Quote from S3: "Accuracy (F1) should show 50%". Why it matters: this checks QAD-108's formula. It is acceptable as evidence that a comparison survives (AC-03 owns that), but the F1 formula itself belongs to QAD-108. Nothing here conflicts with QAD-108.
- S5, related to QAD-108. Quote from S5: "matched 1, extra 3, and golden_total 1". Why it matters: the comparison counts (matched+extra = 4) do not match the 2 generated items. This is not contradicted by either Story, since QAD-108 AC-01 says "do not derive matched from accepted", but it is a state QAD-108 does not create. It also re-verifies QAD-108's F1 formula.
- S6 and S7 are consistent with QAD-101 AC-05 and QAD-108 AC-05 and add no AI dimension assertions beyond them.
- S6: no conflict with QAD-101's date-option rules.

STEP 6. Weak
- S6. Quote: "Adoption should show 100%, i.e. only log A is counted". Why it matters: AC-05 says the AI stats follow the date window, but only Adoption is asserted. Unchanged adoption and Accuracy (F1) are not checked, so a bug that filters only one of them would pass.
- S7. Quote: "Then Adoption should still show 50%". Why it matters: AC-05 covers all AI stats, but only Adoption is checked after the dimension change. Unchanged adoption and Accuracy (F1) could still change with the filter and pass.
- S5. Quote: "Accuracy (F1) should show 40%, unlike Adoption". Why it matters: this is not weak on the value (40% is stated). The phrase "unlike Adoption" is redundant with 40% vs 100%, so it adds nothing.

Classes with no findings: Unsupported, Duplicate.
