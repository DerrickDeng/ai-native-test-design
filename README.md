# AI-Native Test Design

Agent skills that turn a Jira story into traceable BDD tests. The skills also
recommend the automation layer and select the release regression suite.

Each decision has one owner:

- The **requirements** decide what behavior to test.
- The **architecture** decides where automation covers it.
- The **risk** decides how much end-to-end and regression testing is necessary.
- **Deterministic tools** check the structure and do the Jira synchronization.

## Why this is an agent, not a set of prompts

- Four skills have clear limits. Each skill does one job: functional design,
  automation analysis, regression design, or CLI operations.
- Raw requirement snapshots do not change. Each generated test traces back to
  its source.
- Mechanical checks are deterministic. They are separate from the judgment of
  the agent.
- The agent reads a related story only when the target story, AC, or note
  gives a reason.
- Remote writes are explicit commands. Generation and validation never write to
  Jira.
- The same skills are mirrored for Claude Code, Codex, and Gemini CLI. A check
  makes sure that the mirrors stay the same.

[Architecture](docs/architecture.md) shows the components and the data flow.

## Capabilities

| Capability | Skill | Output |
|---|---|---|
| Complete functional tests for a story | `functional-test-design` | `.feature` file and requirement questions |
| Automation-layer recommendation | `automation-coverage-analysis` | Coverage matrix with evidence |
| Release regression selection | `regression-suite-design` | Mapping, compact suite, and Jira summary |
| Deterministic repository operations | `testcase-agent-cli` | Validated local or synchronized files |

## What is in this repository

- `requirements/` and `testcases/`: 8 simulated stories for the
  [QA Dashboard](https://github.com/DerrickDeng/qa-dashboard) (QAD-101 to
  QAD-108). Each story has its requirement, its `.feature` file, a coverage
  trace, open questions, and an independent review.
- `wiki/`: a requirement wiki compiled from those stories. Each rule in the
  wiki links to the story that states it. See [wiki/README.md](wiki/README.md).
- `examples/online-store/`: a small synthetic example for a first look.
- `skills/`: the canonical skills. `.claude/`, `.codex/`, and `.gemini/` hold
  generated mirrors.

## Quick start

You need Node.js 18 or later. The CLI uses only Node built-ins.

```bash
npm test
npm run skills:check
node bin/jira-sync --help
```

Lint a QA Dashboard story. The lint also checks that each quote in the coverage
trace is in the requirement text:

```bash
node bin/jira-sync lint QAD-103 testcases/QAD-103.feature
```

Run the synthetic online-store example:

```bash
node ./bin/jira-sync lint DEMO-101 examples/online-store/testcases/DEMO-101.feature
node scripts/export-jira-user-story.mjs examples/online-store
node scripts/validate-jira-user-story.mjs examples/online-store
```

The example has raw and formatted requirements, four functional scenarios,
generated Jira text, and an automation recommendation. The recommendation
reports existing implementation evidence as `Unknown`, which is correct.

## Workflow

```text
Jira or requirement evidence
          |
          v
immutable raw snapshot -> lossless formatted AC
          |
          v
functional-test-design -> story-level .feature -> deterministic lint and export
          |                         |
          |                         +-> optional, explicit Jira or Zephyr sync
          v
automation-coverage-analysis -> layer and evidence matrix
          |
          v
regression-suite-design -> release mapping and compact regression suite
```

[AGENTS.md](AGENTS.md) has the repository rules and the completion gates. The
judgment for each task is in `skills/`.

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
[docs/evaluation/results.md](docs/evaluation/results.md).

These checks prove the structure and the deterministic rules. They do not
prove that the business logic is correct or that the product works. That needs
a semantic review and, where applicable, evidence from a test run.

## Five-minute walkthrough

1. Read the responsibility table in [Architecture](docs/architecture.md). It
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
[the public-release checklist](docs/public-release-checklist.md).
