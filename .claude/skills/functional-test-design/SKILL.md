---
name: functional-test-design
description: Design or update complete Story-level functional or manual UAT scenarios when explicit requirement evidence needs traceable Gherkin coverage. Use for deciding what behavior to test, not where to automate it or which cases belong in release regression.
metadata:
  short-description: Design AC-grounded functional tests
---

# Functional Test Design

Turn one Story's verified requirement evidence into complete, executable functional scenarios without inventing behavior or claiming execution.

Completeness comes from a checkable trace: every claim in the requirement gets a disposition, and every assertion points back to a quote. Scenario count is not a measure.

## Input & Evidence Contract

- Required input is one identifiable Story with a reviewed, lossless formatted requirement snapshot. Keep the dated raw snapshot as immutable audit evidence.
- Permitted evidence is the Story description, Acceptance Criteria, explicitly referenced screenshots, confirmed notes, and related Stories identified by explicit requirement evidence.
- Treat screenshots and related Stories as scoped supporting evidence, not permission to expand or contradict the target Story. Record conflicts instead of choosing a preferred interpretation silently.
- If no reliable Story or formatted requirement exists, stop design and report the missing input. If a missing rule would change an expected result or branch, stop only the affected scenario, record the question in `requirements/<ISSUE_ID>/note.md`, and continue with independent supported behavior.

## Non-Negotiables

- Completeness means covering every explicit, independently observable claim. It does not mean adding imagined validation, failure, permission, performance, accessibility, or security cases.
- Every generated assertion must trace to evidence in scope. Do not turn common product behavior into an unstated requirement.
- The expected result is never chosen by the designer. It is `Stated` by a quote, or `Derived` from a stated rule applied to chosen test data. If two reasonable engineers could expect different results, write a question, not an assertion.
- A `Then` states only what to observe. Put the arithmetic or reasoning for an expected value in the coverage trace `Basis`, not in the step. Do not add "i.e. ..." or "not the average" wording. Keep a negation ("should not show 0%") only when the requirement states it.
- Keep exactly one parent issue-key tag above `Feature:` and no scenario-level tags. Do not add Unit, Integration, E2E, FE, BE, ownership, risk, or TBC tags.
- Prefix every Scenario and Scenario Outline name with a sequential zero-padded number starting at `01`; keep the sequence continuous in file order.
- Use only `Given`, `When`, and `Then`; repeat the parent keyword instead of `And` or `But`. Do not use `Background`.
- Keep each manual scenario independently executable. Put sources, rationale, architectural analysis, and open questions outside the `.feature` file.
- Never describe generated scenarios as executed tests or claim product behavior was verified.

## Workflow & Routing

1. **Resolve inputs.** Find the target Story, latest formatted requirement, raw snapshot, referenced media, existing `note.md`, and existing `coverage.md`.
2. **Read related Stories.** Open every Story in the requirement's Related Stories section, plus any the AC or note names. Follow [cross-story context](references/cross-story-context.md). Classify each relation and fill the trace's Related Stories table.
3. **Decompose into atoms.** Split each sentence of the requirement into independently checkable claims, guided by [assertion atoms](references/assertion-atoms.md). Write each atom with an exact quote into the Atoms table of `requirements/<ISSUE_ID>/coverage.md`. Follow [coverage trace](references/coverage-trace.md). The inventory is a written artifact, not private thinking.
4. **Give every atom a disposition.** `Covered`, `Question`, `Owned elsewhere`, or `Not testable`. Record each blocking question in `note.md` before drafting. Do not silently import another Story's behavior or leave active TBC comments in the feature.
5. **Check overlap.** Compare planned scenarios with the Story's own plan and with existing features of related Stories. Keep a scenario only if it can fail where no other scenario fails.
6. **Design scenarios from `Covered` atoms.** Choose test data that makes each atom falsifiable, such as data where a wrong formula or wrong selection would change the result. Split mutually exclusive states and materially different outcomes. Use a Scenario Outline only when explicit data rows share the same action and assertion structure; every Examples column must affect a step or assertion.
7. **Write or update `testcases/<ISSUE_ID>.feature`,** keeping the complete entry state and navigation a manual tester needs. Number scenarios from `01`.
8. **Fill the Assertions table.** One row per `Then`, pointing to an atom, typed `Stated` or `Derived`, with the arithmetic or logic as `Basis` when derived. Remove any `Then` you cannot trace.
9. **Run lint:** `node bin/jira-sync lint <ISSUE_ID>`. Fix every error. Treat warnings as questions to answer. When you remove, merge, or renumber a scenario, also fix any text in `note.md` and `coverage.md` that describes it. Lint catches numbered mentions only.
10. **Run the [independent review](references/independent-review.md)** in a fresh context that does not see the atom list, and wait for its result before you report. A review that has not returned counts as not run. Save what it returned in `requirements/<ISSUE_ID>/review.md`. Verify each finding against its quoted source, fix the accepted ones, and record why any were rejected. Run lint again after changes.
11. **Export or synchronize only when separately requested.** Use `testcase-agent-cli` for deterministic mechanics. Remote Jira or test-management writes require explicit user intent.

## Output Contract & Quality Gates

Report:

- generated or changed artifact paths, including `coverage.md` and `note.md`;
- atom counts by disposition, and which explicit behaviors or AC branches they cover;
- how many assertions are `Derived`, with the basis of each;
- each related Story and how it was handled;
- unresolved questions and whether they block any scenario;
- mechanical validation performed, with lint errors and warnings and how each warning was answered;
- independent review status: run and returned, or not run (including one started but not returned), and each finding accepted or rejected with the reason;
- whether any remote system was changed.

Before completion, verify:

- every atom has a disposition, and every `Covered` atom has at least one observable assertion;
- every `Then` has a trace row, and no assertion is `Inferred`;
- every quote appears in its source, and no text in `note.md` or `coverage.md` describes a scenario that no longer exists;
- every related Story has a handling row, and no rule owned by another Story is retested;
- no two scenarios fail for exactly the same reason;
- expected values, state transitions, filtering, ordering, messages, or persistence are asserted when the requirement specifies them;
- negations, formulas, empty states, selection rules, and consistency across surfaces are asserted where the text states them;
- mutually exclusive states and independently failing outcomes are not hidden in one scenario;
- Scenario and Scenario Outline names use a continuous `01`, `02`, ... prefix sequence in file order;
- every Examples value is used and no generated edge case lacks evidence;
- the feature has no prohibited tags, keywords, analysis comments, or unresolved assumptions;
- lint passes, or the exact unrun or failed status is reported without claiming completion.

## Boundaries & Stop Conditions

- Keep automation-layer placement out of the functional feature; route that decision to `automation-coverage-analysis`.
- Keep release-suite selection out of this task; route it to `regression-suite-design` after functional coverage exists.
- Do not generate the affected scenario when actor, trigger, or expected outcome is missing or contradictory. Report the evidence gap instead.
- Do not fetch, export, upload, or synchronize unless the user requested that operation. A request to design tests does not authorize a remote write.

## References

- Read [assertion atoms](references/assertion-atoms.md) when decomposing the requirement and when checking for missed assertions.
- Read [coverage trace](references/coverage-trace.md) for the `coverage.md` format, dispositions, and a worked example.
- Read [cross-story context](references/cross-story-context.md) when the Story has related Stories or when overlap is suspected.
- Read [independent review](references/independent-review.md) before the review step.
- Read [examples](references/examples.md) when an explicit table, conditional branch, or evidence gap needs a concrete design anchor.
- Read [known failure modes](references/failure-modes.md) when reviewing a complex feature or diagnosing incomplete, inflated, duplicated, or untraceable coverage.
