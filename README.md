# BDD Test Case Agent

A repo-native reference architecture for turning Acceptance Criteria into traceable BDD functional tests, analyzing automation coverage, composing release regression suites, and synchronizing approved artifacts to Jira-compatible systems.

The central design choice is separation of concerns:

- requirements decide **what behavior must be tested**;
- architecture decides **where automation should cover it**;
- risk decides **how much E2E and regression depth is justified**;
- deterministic tooling verifies structure and performs external synchronization.

## Why this is an agent, not a prompt collection

- Four bounded skills route functional design, automation analysis, regression design, and CLI operations.
- Raw requirement snapshots remain immutable; generated artifacts retain traceability.
- Mechanical checks are deterministic and separate from semantic agent judgment.
- Related Story context is traced to the Story, AC, or note that justifies reading it.
- Remote writes are explicit operations and are not implied by generation or validation.
- The same canonical skills are mirrored and checked for Codex, Claude Code, and Gemini CLI.

See [Architecture](docs/architecture.md) for the component boundaries and data flow.

## Capabilities

| Capability | Canonical skill | Principal artifact |
|---|---|---|
| Complete Story functional tests | `functional-test-design` | `.feature` plus requirement questions |
| Automation-layer recommendation | `automation-coverage-analysis` | Evidence-based coverage matrix |
| Release regression composition | `regression-suite-design` | Mapping, compact suite, Jira summary |
| Deterministic repository operations | `testcase-agent-cli` | Validated local or synchronized artifacts |

## Quick start

Requirements: Node.js 18 or later. The CLI uses Node built-ins and has no runtime package dependencies.

```bash
npm test
npm run skills:check
node bin/jira-sync --help
```

The synthetic online-store example exercises the workflow without proprietary data:

```bash
node ./bin/jira-sync lint DEMO-101 examples/online-store/testcases/DEMO-101.feature
node scripts/export-jira-user-story.mjs examples/online-store
node scripts/validate-jira-user-story.mjs examples/online-store
```

The example includes raw and formatted requirements, four functional scenarios, generated Jira text, and an automation recommendation that correctly reports existing implementation evidence as `Unknown`.

## Repository workflow

```text
Jira or requirement evidence
          |
          v
immutable raw snapshot -> lossless formatted AC
          |
          v
functional-test-design -> Story-level .feature -> deterministic lint/export
          |                         |
          |                         +-> optional explicit Jira/Zephyr sync
          v
automation-coverage-analysis -> layer/evidence matrix
          |
          v
regression-suite-design -> release mapping and compact regression suite
```

Detailed repository rules and completion gates live in [AGENTS.md](AGENTS.md). Task-specific judgment lives in `skills/`.

## Canonical skills and mirrors

Edit only `skills/`, then regenerate the agent-specific mirrors:

```bash
npm run skills:sync
npm run skills:check
```

The check fails when `.codex/skills`, `.claude/skills`, or `.gemini/skills` differs from the canonical source.

## Related Story context

Read the target Story and its AC first. Follow another Story when the target requirement names it or describes a prerequisite that the other Story explains. Confirm the rule in that Story, cite the original evidence, and record conflicts in `note.md`. A generated Wiki can help locate and synthesize related requirements but does not replace their snapshots.

## Jira adapter configuration

Copy the configuration and credential templates locally:

```bash
cp testcase-agent.config.example.json testcase-agent.config.json
cp auth.json.example auth.json
```

Both local files are ignored by Git. Configure installation-specific fields and option IDs in `testcase-agent.config.json`; do not hard-code them in skills or core policy.

Supported environment overrides include:

- `TESTCASE_AGENT_ROOT`
- `TESTCASE_AGENT_CONFIG`
- `JIRA_BASE_URL`
- `JIRA_AC_FIELD`
- `JIRA_BDD_FIELD`
- `JIRA_USER_STORY_ENDPOINT`
- `JIRA_TEST_ISSUE_TYPE`
- `JIRA_TEST_LEVEL_FIELD`

`fetch` is a remote read that creates a local snapshot. `upload-user-story` and `create-zephyr-tests` are remote writes and should be run only after reviewing the exact target and generated content.

## Company-environment smoke

After placing the repository inside the company network and creating local `testcase-agent.config.json` and `auth.json` files, verify the integration in two stages:

```bash
# Local and remote-read smoke
npm test
node bin/jira-sync fetch <READ_ONLY_SMOKE_ISSUE_ID>
```

Confirm that the fetch created a dated raw snapshot under `requirements/<ISSUE_ID>/` and did not change Jira. Stop after this read-only smoke unless a separate request explicitly authorizes a write against a designated test Story.

```bash
# Run only with separate authorization for the exact test Story.
node bin/jira-sync upload-user-story <TEST_ISSUE_ID>
node bin/jira-sync create-zephyr-tests <TEST_ISSUE_ID>
```

Never use a production Story as the first remote-write smoke target.

## Validation

```bash
npm test
npm run skills:check
node scripts/validate-jira-user-story.mjs examples/online-store
npm run release:build
git diff --check
```

Passing these checks proves structural and deterministic invariants. It does not prove business correctness or successful product execution; those require semantic review and, where applicable, execution evidence.

## Five-minute interview walkthrough

1. Start with the responsibility table in [Architecture](docs/architecture.md) and explain why functional design, automation placement, and release regression are separate decisions.
2. Compare DEMO-102's delivery-method prerequisite with DEMO-101's AC to show how cross-Story context stays anchored to source requirements.
3. Compare the formatted AC, `.feature`, and automation coverage analysis for `DEMO-102` to demonstrate traceability and honest `Unknown` coverage status.
4. Run the validation block above to show deterministic quality gates.
5. Run `npm run release:build` to demonstrate that publication itself uses a reviewed allowlist and a fresh-history boundary.

## Publishing safely

Never publish a working history that contained organization-owned Stories, screenshots, internal hosts, usernames, field identifiers, or credentials. Run `npm run release:build`, then initialize a new Git history from the allowlisted directory it prints. Follow [the public-release checklist](docs/public-release-checklist.md).
