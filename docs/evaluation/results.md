# Evaluation Results

Results of the `functional-test-design` Skill evaluation. Small samples are
reported as passed checks, not as success rates.

## functional-test-design

Recorded on 2026-09-29. Executor and grader: Claude Sonnet 5.5. The new Skill
version is compared with the previous one on the same four tasks
(see [evals.json](../../skills/functional-test-design/evals/evals.json)).
Each task ran **3 times** per version.

| Task                                      | New version | Previous version |
| ----------------------------------------- | ----------- | ---------------- |
| 1 dense-ac-hidden-claims                  | 48 / 48     | 42 / 48          |
| 2 gaps-and-conflict-no-guessing           | 50 / 50     | 45 / 51          |
| 3 related-stories-and-ownership           | 30 / 36     | 25 / 36          |
| 4 independent-review-finds-seeded-defects | 27 / 30     | 25 / 30          |
| **Total**                                 | **155 / 164** | **137 / 165**  |

How to read this:

- Tasks 1 and 2 passed every check in all three runs of the new version.
- Task 3 varied between runs (11, 8, and 11 of 12 checks), so related-Story
  ownership is the least stable behavior.
- Totals differ slightly between versions because one grading run counted one
  fewer check on task 2.
- The Skill has changed since this run; these results have not been re-run
  against the current version.

## Deterministic checks

`npm test` runs the CLI, lint, coverage-trace, and Jira adapter tests on every
change: 66 / 66 pass. CI also runs Skill validation, mirror checks, example
validation, and the public release build.
