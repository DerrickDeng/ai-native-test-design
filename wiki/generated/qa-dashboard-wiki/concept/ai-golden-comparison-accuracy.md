---
type: concept
title: AI Golden-comparison accuracy
description: Golden-comparison precision, recall, F1, unknown-state, and grouping rules for AI accuracy testing.
tags: [ai, accuracy, golden-comparison, f1, bdd]
---

# AI Golden-comparison accuracy

AI accuracy is evidence from Golden comparison, not a derivative of adoption. Missing comparison evidence is represented as unknown (`—`), not as a zero score.

## Explicit rules

- `precision = matched/(matched + extra)` and `recall = matched/golden_total`; counts are summed before calculating. `matched` must not be derived from accepted items. [QAD-108](viking://resources/qa-dashboard-sources/QAD-108/QAD-108-2026-09-28-formatted.md)
- When precision and recall are calculable and their sum is positive, `F1 = 2*precision*recall/(precision+recall)`. When either component cannot be calculated or their sum is zero, current F1 displays `—`. [QAD-108](viking://resources/qa-dashboard-sources/QAD-108/QAD-108-2026-09-28-formatted.md)
- A log without comparison does not contribute to accuracy numerator or denominator, but can contribute adoption data. When no Golden comparison is calculable, related accuracy is `—`, not fabricated `0%`. [QAD-108](viking://resources/qa-dashboard-sources/QAD-108/QAD-108-2026-09-28-formatted.md)
- The AI page presents F1 with Precision and Recall and groups the accuracy evidence by agent, model, and prompt version. Statistics are date-window-only. [QAD-108](viking://resources/qa-dashboard-sources/QAD-108/QAD-108-2026-09-28-formatted.md)

## BDD test implications

Use count fixtures that distinguish aggregate-count calculation from averaging per-log precision/recall. Include an adoption-bearing log without comparison to prove metric independence, and cover each specified unknown path with `—` rather than a numerical score. Do not add Application, Region, or Environment assertions to this page.

**Inference:** a scenario can vary acceptance while holding Golden counts constant to demonstrate that accuracy is not calculated from adoption. This follows the explicit prohibition on deriving `matched` from accepted in [QAD-108](viking://resources/qa-dashboard-sources/QAD-108/QAD-108-2026-09-28-formatted.md).

## Open questions

No separate QAD-108 note was supplied. Display precision for AI ratios remains unresolved in the QAD-107 note and should not be assumed for Precision, Recall, or F1. [QAD-107 questions](viking://resources/qa-dashboard-sources/QAD-107-note/note.md)

## Sources

- [QAD-108 — AI Golden comparison and unknown values](viking://resources/qa-dashboard-sources/QAD-108/QAD-108-2026-09-28-formatted.md)
- [QAD-107 simulated requirement questions](viking://resources/qa-dashboard-sources/QAD-107-note/note.md)