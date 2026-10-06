---
type: concept
title: AI adoption metrics
description: Aggregation, empty-state, filtering, and interpretation rules for AI adoption and unchanged adoption.
tags: [ai, adoption, metrics, bdd]
---

# AI adoption metrics

AI adoption measures whether generated items were accepted and whether accepted items were unchanged; it is not a correctness measure. The current contract limits AI filtering to the date window.

## Explicit rules

- For normal logs with items and human-review records, `generated` counts generated items, `accepted` counts `accepted=true`, and `accepted_unchanged` additionally has `edited=false`. [QAD-107](viking://resources/qa-dashboard-sources/QAD-107/QAD-107-2026-09-28-formatted.md)
- `adoption = accepted/generated` and `unchanged adoption = accepted_unchanged/generated`. Counts are summed before division; per-run percentages are not averaged. [QAD-107](viking://resources/qa-dashboard-sources/QAD-107/QAD-107-2026-09-28-formatted.md)
- A log with no items and no explicit `generated` contributes to neither adoption numerator nor denominator but can retain cost, tokens, and a Golden comparison. A zero denominator displays `—`. [QAD-107](viking://resources/qa-dashboard-sources/QAD-107/QAD-107-2026-09-28-formatted.md)
- Adoption, unchanged adoption, and Accuracy (F1) are displayed together, but high adoption does not prove high accuracy. AI statistics are filtered by date window, not by Application, Region, or Environment. [QAD-107](viking://resources/qa-dashboard-sources/QAD-107/QAD-107-2026-09-28-formatted.md)

## BDD test implications

Use uneven per-run denominators to distinguish summed-count aggregation from averaging percentages. Test a no-items/no-explicit-generated log both for exclusion from adoption and for its ability to coexist with non-adoption data. Keep accuracy assertions in [AI Golden-comparison accuracy](ai-golden-comparison-accuracy.md).

**Inference:** a high-adoption fixture should not be used as evidence of high F1, because the requirement explicitly gives the measures different meanings. This is directly bounded by [QAD-107](viking://resources/qa-dashboard-sources/QAD-107/QAD-107-2026-09-28-formatted.md).

## Open questions

- The supplied note says missing `items` is excluded when `generated` is also omitted, but an explicit positive `generated` with no items affects the denominator in the implementation. Other combinations require clarification and must not be generalized. [QAD-107 questions](viking://resources/qa-dashboard-sources/QAD-107-note/note.md)
- Adoption display form and precision are unspecified. Cost and token display location/format is also not observable from the requirement. [QAD-107 questions](viking://resources/qa-dashboard-sources/QAD-107-note/note.md)
- The time field compared with the date window is unspecified; existing proposed examples avoid window boundaries. [QAD-107 questions](viking://resources/qa-dashboard-sources/QAD-107-note/note.md)

## Sources

- [QAD-107 — AI adoption and human editing cost](viking://resources/qa-dashboard-sources/QAD-107/QAD-107-2026-09-28-formatted.md)
- [QAD-107 simulated requirement questions](viking://resources/qa-dashboard-sources/QAD-107-note/note.md)