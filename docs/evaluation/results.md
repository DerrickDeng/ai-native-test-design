# Evaluation Results

These are the results of the `functional-test-design` skill evaluation. We show
small samples as passed checks, not as success rates.

## functional-test-design: with and without the skill

Recorded on 2026-10-09. The executor and the grader are Claude Sonnet 5.5. The
evaluation runs the same four tasks
(see [evals.json](../../skills/functional-test-design/evals/evals.json)) in two
configurations:

- **With the skill:** the agent reads the current skill and follows it.
- **Without the skill:** the agent gets the same task and the same repository,
  but no skill.

Both configurations work in the same repository, with the same `AGENTS.md`
rules and the same lint. So the difference shows what the skill adds on top of
the repository rules. Each task ran **3 times** in each configuration. One
grader instruction set and one checklist grade all 24 runs.

| Task                                      | Without the skill | With the skill    |
| ----------------------------------------- | ----------------- | ----------------- |
| 1 dense-ac-hidden-claims                  | 47 / 48           | 47 / 48           |
| 2 gaps-and-conflict-no-guessing           | 46 / 51           | **51 / 51**       |
| 3 related-stories-and-ownership           | 27 / 36           | **35 / 36**       |
| 4 independent-review-finds-seeded-defects | 21 / 30           | **26 / 30**       |
| **Total**                                 | **141 / 165**     | **159 / 165**     |
| Agent time, median (range)                | 1.3 min (1.1–3.4) | 3.1 min (1.1–7.6) |

How to read this:

- The repository rules alone get the agent far. Without the skill, the agent
  still writes a coverage trace and records open questions, and task 1 is a
  tie.
- The skill adds the most on the hardest behaviors: it records every
  requirement gap and conflict as a question instead of a guess (task 2), it
  does not retest rules that another story owns (task 3), and its reviews are
  more precise and quote the source text (task 4).
- The independent review is a step that only the skill runs. Checks marked
  `[process]` need it: 5 / 15 passed without the skill and 15 / 15 with it.
  Without these checks, the totals are 136 / 150 and 144 / 150.
- The independent review is also why the skill takes about 2 minutes longer.
  The time starts at the prompt and stops at the final report.
- In one run of task 1, the agent with the skill raised a blocking question
  about an undefined "category" instead of writing a table test. The checklist
  counts this as a missed check.

## Earlier comparison with the previous skill version

On 2026-09-29, an earlier checklist compared the skill with its previous
version: 155 / 164 against 137 / 165 (4 tasks × 3 runs). The checklist for
tasks 3 and 4 changed after that run, so those numbers do not compare directly
with the table above.

## Deterministic checks

`npm test` runs the CLI, lint, coverage-trace, and Jira adapter tests on each
change: 66 / 66 pass. CI also runs the skill validation, the mirror check, the
example validation, and the public release build.
