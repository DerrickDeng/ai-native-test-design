# Usage Guide

Detailed setup, validation, and maintenance instructions for AI-Native Test Design. Start with the [project README](../README.md) for an overview and a local example. Run the commands below from the repository root.

## Bundled examples

The `requirements/` and `testcases/` folders contain synthetic QA Dashboard Stories and tests. Each Story has requirement files, BDD cases, a coverage trace, open questions, and an independent review. These are examples, not company Jira exports or production test results.

The [online-store example](../examples/online-store/) contains raw and formatted requirements, four functional scenarios, generated Jira text, and an automation recommendation. Its existing implementation evidence is reported as `Unknown`.

The [Requirement Wiki](../wiki/README.md) provides related requirement context. The [Wiki example record](../wiki/examples/build-record.md) contains its bundled build and retrieval results.

## Skills and mirrors

Edit only `skills/`. Then generate the mirrors again:

```bash
npm run skills:sync
npm run skills:check
```

The check fails if `.codex/skills`, `.claude/skills`, or `.gemini/skills` is
different from `skills/`.

## Related story context

Read the target story and its AC first. Read another story only when the target
requirement names it or needs a rule that the other story owns. Confirm the rule
in that story, cite the original text, and record conflicts in `note.md`. The
wiki helps you find related requirements. It does not replace them.

## Jira adapter configuration

Copy the configuration and credential templates:

```bash
cp testcase-agent.config.example.json testcase-agent.config.json
cp auth.json.example auth.json
```

Git ignores both local files. Put the fields and option IDs of your Jira
installation in `testcase-agent.config.json`. Do not put them in the skills or
the core policy.

These environment variables override the configuration:

- `TESTCASE_AGENT_ROOT`
- `TESTCASE_AGENT_CONFIG`
- `JIRA_BASE_URL`
- `JIRA_AC_FIELD`
- `JIRA_BDD_FIELD`
- `JIRA_USER_STORY_ENDPOINT`
- `JIRA_TEST_ISSUE_TYPE`
- `JIRA_TEST_LEVEL_FIELD`

`fetch` reads from Jira and writes a local snapshot. `upload-user-story` and
`create-zephyr-tests` write to Jira. Run them only after you review the exact
target and the generated content.

## First connection to a company Jira

Put the repository inside the company network. Create the local
`testcase-agent.config.json` and `auth.json` files. Then do the check in two
steps.

Step 1, read only:

```bash
npm test
node bin/jira-sync fetch <READ_ONLY_SMOKE_ISSUE_ID>
```

Make sure that the fetch created a dated raw snapshot in
`requirements/<ISSUE_ID>/` and did not change Jira. Stop here, unless you have
a separate approval to write to a specified test story.

Step 2, write (only with that approval):

```bash
node bin/jira-sync upload-user-story <TEST_ISSUE_ID>
node bin/jira-sync create-zephyr-tests <TEST_ISSUE_ID>
```

Do not use a production story for the first write.

## Validation

```bash
npm test
npm run skills:check
node scripts/validate-jira-user-story.mjs examples/online-store
npm run release:build
git diff --check
```

CI runs these checks on each push. The agent evaluation results for
`functional-test-design` are in
[docs/evaluation/results.md](evaluation/results.md).

These checks prove the structure and the deterministic rules. They do not
prove that the business logic is correct or that the product works. That needs
a semantic review and, where applicable, evidence from a test run.

## Five-minute walkthrough

1. Read the responsibility table in [Architecture](architecture.md). It
   shows why functional design, automation placement, and release regression
   are separate decisions.
2. Open `requirements/QAD-103/`. Compare the requirement, the coverage trace,
   and `testcases/QAD-103.feature`. Each `Then` traces to an exact quote.
3. Read `requirements/QAD-103/review.md`. An independent review found gaps in
   the first design, and the notes record the open questions.
4. Run the validation commands above. They are the deterministic quality gates.

## Publishing safely

Do not publish a history that contains company stories, screenshots, internal
hosts, user names, field IDs, or credentials. Before the first publication,
start a new Git history. `npm run release:build` copies only the allowlisted,
tracked files and scans them for internal hosts and real issue keys. Follow
[the public-release checklist](public-release-checklist.md).
