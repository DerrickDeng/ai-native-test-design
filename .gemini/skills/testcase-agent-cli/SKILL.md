---
name: testcase-agent-cli
description: Operate this repository's deterministic testcase-agent CLI for requirement fetch, feature lint and export, and Jira or Zephyr synchronization. Use for CLI execution and workflow safety, not test-design judgment.
metadata:
  short-description: Run the testcase workflow CLI safely
---

# Testcase Agent CLI

Translate an operational request into the repository's deterministic commands. This skill operates artifacts; it does not decide functional behavior, automation placement, or regression selection.

## Quick Start

Run commands from the repository root. `node bin/jira-sync` is the supported local invocation.

```bash
# Inspect the actual installed CLI before relying on a remembered flag.
node bin/jira-sync --help

# Normal Story path after the requirement has been reviewed and transcribed.
node bin/jira-sync lint <ISSUE_ID>
node bin/jira-sync export <ISSUE_ID>
```

## Route Before Running

- For complete Story-level functional scenarios, use `functional-test-design` first.
- For where automation should live, use `automation-coverage-analysis`; do not alter the functional feature.
- For a release suite, use `regression-suite-design`; do not replace source functional tests.
- For fetch, lint, export, validation, skill maintenance, or Jira/Zephyr synchronization, use the matching command below.

## Commands

### Requirement snapshot

```bash
node bin/jira-sync fetch <ISSUE_ID>
```

`fetch` reads Jira and creates a dated local snapshot under `requirements/<ISSUE_ID>/`. It never replaces the required lossless `-formatted.md` transcription; make that copy manually before functional design. Follow related Stories only when the Story, AC, or note provides a meaningful reason.

### Functional Feature and Jira-field Export

```bash
node bin/jira-sync lint <ISSUE_ID> [FEATURE_PATH]
node bin/jira-sync export <ISSUE_ID> [FEATURE_PATH]
node bin/jira-sync export <ISSUE_ID> --force
node bin/jira-sync export-user-story
npm run validate:user-story
node scripts/validate-jira-user-story.mjs <ROOT>
```

`lint` is read-only. A normal `export` writes `jira-user-story/<ISSUE_ID>.txt`; when an explicit feature is outside `testcases/`, it lints but creates no Jira-field text. `--force` is an explicitly non-conforming local export, never a compliance result.

For Story-level functional features, `lint` also requires Scenario and Scenario Outline names to use a continuous zero-padded sequence (`01`, `02`, ...) in file order.

### Explicit Remote Synchronization

```bash
node bin/jira-sync upload-user-story <ISSUE_ID>
node bin/jira-sync create-zephyr-tests <ISSUE_ID> [FEATURE_PATH]
node bin/jira-sync create-zephyr-tests <ISSUE_ID> --prefix "[UAT]" --level "SIT,UAT" --assignee me
node bin/jira-sync create-zephyr-tests <ISSUE_ID> --scenario "approval"
```

These are remote writes. Run them only after the user has explicitly named the intended mutation in the current request.

### Repository Maintenance

```bash
npm run skills:sync
npm run skills:check
npm run skills:validate
npm test
npm run release:build
git diff --check
```

Edit `skills/` only; `skills:sync` refreshes the Codex, Claude, and Gemini mirrors.

## Command Selection and Safety

The commands above are the supported operational interface. Prefer canonical commands over compatibility aliases.

- Run `node bin/jira-sync --help` if command availability or flags may have changed; do not invent a command from documentation alone.
- Raw requirement snapshots are immutable audit evidence. Reformat only a dated copy.
- Run lint before export or synchronization. `--force` bypasses a quality gate; it never authorizes a remote mutation and must be reported as non-conforming.
- Treat `.feature` as the source of truth for generated Jira text.
- Remote writes (`upload-user-story`, `create-zephyr-tests`) require explicit user intent immediately before execution. Resolve the issue, generated artifact, and options before calling them.
- Stop after repeated authentication, schema, or remote API failures; do not loop writes.

After any command, report the exact files changed, generated outputs, validation result, and remote records changed when applicable.
