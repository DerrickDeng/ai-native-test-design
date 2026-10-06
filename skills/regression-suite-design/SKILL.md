---
name: regression-suite-design
description: "Build a full mapping from the existing functional tests of every Story in a module, select and combine a compact BDD Regression Suite by business risk, and produce a PO-readable Jira coverage table. Use for designing and maintaining release regression suites, not for test layering or for writing complete functional tests from scratch."
---

# Regression Suite Design

Goal: a few main E2E journeys, plus the high-risk checks that nothing else covers yet. The full mapping keeps the reasons for each choice; the Jira table shows what is actually verified.

## Repository adaptation

In this repository, read the root `AGENTS.md` first; its rules override the default formats below. A suite written to `testcases/` is a Story-level manual UAT artifact: use the parent Story's `@<IssueKey>` Feature tag, no Scenario tags or comments, and no test layering. A standalone cross-Story regression suite that is not written to `testcases/` keeps the default `@regression @<module-name>` format below.

## Hard constraints and conflicts

- Explicit user requests and the latest business confirmations override this skill's defaults; move resolved questions out of Open items. By default keep the original functional tests, install no skill, and write nothing to Jira.
- Every expected result must come from tests you have read, an explicit requirement, or a user confirmation. Record a rule you cannot determine as pending; do not invent an executable expectation. Do not layer tests.
- Each regression case has a stable ID, can run on its own and repeatedly, states its preconditions and data, and does not depend on the order or leftover data of other cases.
- A coverage claim rests on actual assertions and the conditions they apply to; passing through an action is not verifying it. Passing the design checks does not mean the automation is bound, the tests ran, or the product release passed.
- Step selection order: wording the user specified → reuse as is → change parameters only → a new step with a stated basis. Split or rewrite only when the existing wording cannot prove the goal or isolate a separate failure, and record why; do not rewrite for a uniform tone.
- When trade-offs arise, keep business meaning and observability first, then reuse and compactness. Follow the formats below mechanically; make business choices by principle, not by a fixed count or a coverage target.

## Selection and composition principles

1. **Risk decides selection.** State the consequence of a failure and the basis for its likelihood. Core business outages, wrong amounts or data, unauthorized access, and wrong downstream results come first; a severe consequence alone can justify inclusion. No past defects does not mean low risk; do not invent frequencies, scores, or defects.
2. **Main journeys first.** Cover the path from the business entry point to the final result first, then add high-risk rules that are not yet well verified. Field catalogs, ordinary echoes, low-risk formatting, and data variants of the same rule stay in the functional tests by default; an important exception must not be dropped just because it is not the happy path.
3. **Pick representatives by business difference.** Consider roles, structures, states, or configurations separately when they trigger different rules and results; pick representatives for equivalent data, explain why in the mapping, and do not enumerate meaningless combinations.
4. **Combine and deduplicate by verification goal.** Combine only flows with the same goal, compatible roles and data, and a natural sequence. Keep the key checkpoints of each selected business goal; mutually exclusive preconditions, independent exceptions, or high-risk goals that an earlier failure would hide belong in separate cases.
5. **Every Then must protect something.** Prefer final business results, system-derived calculations, key states, and persisted results. Ordinary input echoes, tick confirmations, or repeated results can be dropped when they add no risk value; do not infer that the system state is correct just because "the user did the action". Treat an assertion as a duplicate only when another assertion really proves the same goal.
6. **Maintain a fixed baseline deliberately.** Partial and Not covered are allowed; each new case states its independent value, and related coverage is re-evaluated after edits or deletions. Downgrade only when no other assertion still carries the verification goal; deleting a duplicate assertion does not lower coverage by itself.

## Four-stage workflow

### 1. Save the full mapping first

Read all available source tests, requirements, and business confirmations in scope, and record the file or ticket range, versions, and input gaps. Keep the business Feature grouping; one Story does not have to equal one Feature. When changing an existing regression suite, keep its IDs and decision records.

One row per source Scenario / Scenario Outline; describe the different Examples branches of an Outline in the same row, and do not count data rows as source scenarios. Keep source IDs; without an ID, locate the scenario by file and original title or its existing number, and do not invent a Story ID.

| Feature | Story | Source Scenario ID / Name | Source Location | Covered | Regression Case ID(s) | Rationale |
|---|---|---|---|---|---|---|

When creating a new mapping, first fill in Pending, empty regression IDs, and "to be analyzed"; never derive the source list backwards from the selected regression suite.

### 2. Analyze and design the regression suite

**In this stage, select, combine, and deduplicate by the [selection and composition principles](#selection-and-composition-principles), and show the basis in the rationale.**

Design the Main E2E journey skeleton first, then add Targeted high-risk validations; order the cases the same way. Do not generate one regression case per source scenario and merge them mechanically.

Build a step pool from the source tests. Read source And / But as the Given / When / Then they inherit, keeping their text; count reuse by text only, and separately check that preconditions and parameters are compatible. For each newly written step, record in the step review section of the mapping its text, its basis (requirement, source scenario, or user confirmation), and why no existing step could be reused; do not put this in feature comments or the Jira table.

### 3. Fill in the same mapping

| Status | Meaning |
|---|---|
| Pending | Not analyzed yet; if it remains at the end, state the unfinished scope |
| Covered | Under the applicable preconditions, data, and paths, every independent business check is carried by an assertion |
| Partial | Some checks or branches are carried; state the remaining gaps |
| Not covered | No assertion carries the verification goal; state why it is left out and the remaining risk |
| Needs clarification | Conflicting or insufficient evidence; state the specific question; a candidate ID is not evidence of coverage |

Fill in the actual regression IDs and a specific rationale for each row; many-to-many links are allowed. Summarize the number of unique source scenarios, the count per status, and coverage per Feature; keep confirmed decisions separate from Open items. After a case or assertion changes, re-evaluate by principle 6 and do not keep stale references.

### 4. Generate the Jira description from the final suite

| Type | Regression Case ID | Regression Case | Covered Functions |
|---|---|---|---|

- One row per logical case, with the ID and title exactly as in the suite; Type is Main E2E journey or Targeted high-risk validation.
- **Covered Functions is what the PO reviews directly.** Extract the independent checks from each Then, and list the object, state or result, key values, and Outline branches clearly with numbers and `<br>`. Closely related assertions can share one item, but no result meaning may be lost.
- Check both ways: every independent Then has a matching item, and every item traces back to a Then. Configuration that appears only in Given / When must not be claimed as verified; do not list uncovered items, pending items, source mappings, statuses, or rationale.

## Output format

By default write `mapping.md`, `regression-suite.feature`, and `jira-description.md`; when the user asks for a Markdown suite, put the same content in one Gherkin code block. Other table formats follow the user's convention and keep the same information.

- The Feature's top-level tags are `@regression @<module-name>`, with a stable lowercase kebab-case module name. Keep the output clean by default; keep Scenario tags and comments if the project convention or the source tests need them. No Rule.
- Keep the Gherkin readable; indentation and blank lines between scenarios are not pass conditions of the design Quality Gate.
- Use only Given / When / Then, not And / But. A Then states a business object and an observable result; every Outline placeholder has an Examples column, and data and mutually exclusive branches are compatible.
- A Main E2E title is `[Case ID] <business result>, <key branch 1>, <key branch 2>, …`; keep the dimension order the same within a module, list only branches that are actually configured and tell cases apart, and put dependent settings under the category they belong to. For example, an order module might order its branches as customer type, payment method, delivery method; each module uses its own business dimensions. A targeted case title states the risk rule or state transition.

Before generating, read the [three-file example](references/example.md) for its format and Then choices; its business content is not a requirement of the target module.

## Quality Gate

**Mechanical check**: use the bundled script to check the default tables and Gherkin output; do not write an ad hoc validator:

```sh
python <skill-dir>/scripts/validate.py --sources <source-feature-dir> --suite <suite-file> --mapping <mapping.md> --jira <jira-description.md> --module <module-name>
```

The script checks top-level tags, the structural subset, source-scenario mapping, IDs, titles, and references, Outline data, case order, and recognizable summaries, and reports file and line numbers. It does not restrict indentation, blank lines between scenarios, Scenario tags, or comments. It is a format and consistency checker, not a full Gherkin parser or a business review. The source directory contains only this run's input, and the script excludes the suite output directory. When a non-feature source or a custom table cannot be parsed, check the same list by hand, state which parts were not verified by the script, and do not change the user's format just to pass the check.

Step reuse is reported by occurrence count; new steps are listed once each with a prompt for semantic review, and the presence of new steps does not fail the check by itself. The script cannot judge whether a basis holds, whether parameters are valid, or whether Jira fully carries each Then.

**Semantic check**: review the risk choices and independent-execution conditions, the protective value of each Then, mapping coverage and Examples branches, the basis and necessity of each new step, and the two-way match between Jira and Then. Keep a case or source reference and a short conclusion for each item; focus on every case affected by the user's edits.

Fix mechanical errors first and rerun the related checks; a non-zero exit or a check that did not run must not be reported as passed. Report the design Quality Gate as PASS only when every applicable mechanical and semantic item passes; FAIL when an internal error is found; BLOCKED when a required input or key rule is unresolved. Out-of-scope uncovered items may remain, but state whether they affect the main journeys.

Final brief: number of source scenarios and mapping rows, number of cases and Jira rows and expanded executions, step reuse and new-step counts, check conclusions, and the impact of open items. State clearly that only the design was verified and that no product test was executed. Complete the four stages in one go without asking for confirmation between them.
