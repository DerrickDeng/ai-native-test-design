# Evaluation Results

These are the results of the `functional-test-design` skill evaluation. We show
small samples as passed checks, not as success rates.

## functional-test-design

Recorded on 2026-09-29. The executor and the grader are Claude Sonnet 5.5. The
evaluation compares the new skill version with the previous version on the same
four tasks (see [evals.json](../../skills/functional-test-design/evals/evals.json)).
Each task ran **3 times** for each version.

| Task                                      | New version   | Previous version |
| ----------------------------------------- | ------------- | ---------------- |
| 1 dense-ac-hidden-claims                  | 48 / 48       | 42 / 48          |
| 2 gaps-and-conflict-no-guessing           | 50 / 50       | 45 / 51          |
| 3 related-stories-and-ownership           | 30 / 36       | 25 / 36          |
| 4 independent-review-finds-seeded-defects | 27 / 30       | 25 / 30          |
| **Total**                                 | **155 / 164** | **137 / 165**    |

How to read this:

- Agent time for the new version is a median of 3.0 min, with a range of 1.2 to
  7.3 min over the 12 runs. The time starts at the prompt and stops at the final
  report.
- Tasks 1 and 2 passed all checks in all three runs of the new version.
- Task 3 changed between runs (11, 8, and 11 of 12 checks). Related-story
  ownership is the least stable behavior.
- The totals are slightly different between the versions because one grading
  run counted one check less on task 2.
- The skill changed after this run. We did not run the evaluation again on the
  current version.

## Deterministic checks

`npm test` runs the CLI, lint, coverage-trace, and Jira adapter tests on each
change: 66 / 66 pass. CI also runs the skill validation, the mirror check, the
example validation, and the public release build.
