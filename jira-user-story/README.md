# Jira User story field exports

The `.txt` files generated in this directory are ready to paste into the
corresponding Jira Story ticket's **User story** field.

If the field uses Jira's rich-text editor, insert a code block before pasting so
that indentation and Gherkin data tables remain unchanged. For a plain-text
field, paste the content directly.

Each export follows the Jira **User story** field dialect:

- Every line starts at column zero, including `Given`, `When`, `Then`,
  `Examples`, and data-table rows.
- Scenario outlines are exported as `Scenario` because the field does not
  support the `Scenario Outline` keyword.
- `Examples` tables are retained.
- Every source comment line is exported separately as `!-- [Comment text]`.

Repository-only metadata is omitted:

- `Feature`

All source tags are retained at column zero, including the Story tag and the
unit, integration, end-to-end, frontend, backend, and combined-scope tags.
Because the Jira field has no `Feature` node, the source Feature-level Story tag
is repeated before every Scenario to preserve its original scope.

The executable source remains under `testcases/`. The export scripts preserve
the source's relative directory structure. For example,
`testcases/QAD-101.feature` is exported as `jira-user-story/QAD-101.txt`.
Regenerate these exports after changing a feature file:

```shell
./bin/jira-sync export-user-story
```

That command runs both scripts and fails if the validation does. They can also be
run directly:

```shell
node scripts/export-jira-user-story.mjs
node scripts/validate-jira-user-story.mjs
```
