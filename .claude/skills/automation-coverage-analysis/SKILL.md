---
name: automation-coverage-analysis
description: Analyze where existing functional scenarios should be covered across unit or component, integration or contract, and end-to-end automation. Use for layer recommendations and coverage evidence review, not functional scenario generation.
metadata:
  short-description: Recommend automation layers with evidence
---

# Automation Coverage Analysis

Recommend the cheapest reliable automation boundary for each functional behavior while preserving the E2E checks that protect real cross-system journeys.

## Boundaries

- Consume functional scenarios as business behavior input; do not rewrite or retag their source `.feature` file.
- A recommendation is not proof of existing coverage. Keep `Recommended layer` separate from `Evidence status`.
- Base placement on architecture, dependencies, data ownership, and observable contracts. If those are unknown, say so.
- Treat thresholds, layer allocations, and consolidation proposals as reviewable recommendations, not proven policy.

## Workflow

1. Read the target functional scenarios and identify each independently asserted behavior.
2. Read [layer model](references/layer-model.md). For frontend-heavy behavior, also read [frontend boundaries](references/frontend-boundaries.md).
3. Gather available architecture evidence: component boundaries, service contracts, data ownership, external dependencies, existing tests, CI reports, or code changes.
4. Assign a recommended primary layer and optional complementary layer. Explain the boundary and dependency strategy.
5. Apply [evidence contract](references/evidence-contract.md) to distinguish verified implementation from claims and unknowns.
6. Check portfolio-level duplication: retain E2E for principal and critical cross-system journeys, while moving deterministic permutations to lower layers where practical.
7. Report unresolved architecture questions and residual risks. Do not create implementation subtasks or change remote systems unless separately requested.

## Output Contract

Use this minimum matrix:

| Scenario / behavior | Recommended primary layer | Component or owner | Dependency strategy | Evidence status | Rationale | Residual risk |
|---|---|---|---|---|---|---|

Add a short summary covering:

- proposed E2E journeys retained;
- high-volume permutations moved lower;
- duplicated or missing coverage;
- architecture facts still needed;
- evidence inspected and evidence unavailable.

Do not report a layer as covered unless current test or CI evidence was actually inspected.
