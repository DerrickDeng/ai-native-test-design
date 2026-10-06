# BDD Test Case Agent — Operating Contract

This repository is a repo-native quality-engineering workflow. It turns requirement evidence into Story-level functional tests, analyzes automation placement separately, composes release regression suites, and provides deterministic Jira/test-management mechanics through a CLI.

## 1. Sources of Truth

- `AGENTS.md` defines repository-wide routing, invariants, safety boundaries, and completion gates.
- `skills/` is the canonical source for task-specific agent behavior. `.codex/skills`, `.claude/skills`, and `.gemini/skills` are generated mirrors; never edit them directly.
- `.feature` files are the source of truth for generated Jira user-story text and manual test synchronization.
- CLI code owns deterministic mechanics. A skill must not duplicate transformation or synchronization logic that the CLI already implements.

`CLAUDE.md` and `GEMINI.md` are thin adapters that import this file.

## 2. Capability Routing

| User intent | Skill | Output |
|---|---|---|
| Design complete tests for one Story or AC | `functional-test-design` | Story-level functional/UAT `.feature`, questions, validation summary |
| Decide where scenarios should be automated | `automation-coverage-analysis` | Layer recommendation and evidence matrix; source feature unchanged |
| Build a release regression suite from existing functional tests | `regression-suite-design` | Full mapping, compact regression suite, PO-readable Jira description |
| Fetch, lint, export, upload, or synchronize | `testcase-agent-cli` | Deterministic CLI execution and change report |

Do not merge functional test design with automation-layer placement. Requirements determine what behavior must be tested; architecture determines where it should be automated; risk determines how deeply and how often.

## 3. Evidence Contract

1. Generate only behavior supported by the Story description, Acceptance Criteria, referenced screenshots, confirmed notes, or explicitly related Stories.
2. If a rule is missing or conflicting, record an open item in the Story's `note.md`. Do not silently resolve it.
3. Distinguish reviewed facts from recommendations and unknowns.
4. Never describe generated tests as executed tests.
5. Never claim automation coverage without inspecting current test code, CI evidence, traces, or reports. Use `Verified`, `Claimed`, `Unknown`, or `Missing` as defined by the automation analysis skill.

## 4. Repository Layout

```text
AGENTS.md                          repository operating contract
skills/                            canonical task skills
.codex/skills/                     generated Codex mirror
.claude/skills/                    generated Claude mirror
.gemini/skills/                    generated Gemini mirror
bin/jira-sync                      CLI entry point
src/                               CLI, adapters, and deterministic policies
scripts/                           repository transformations and validators
requirements/
  <ISSUE_ID>/
    <ISSUE_ID>-<DATE>.md           immutable raw snapshot
    <ISSUE_ID>-<DATE>-formatted.md lossless transcription used for design
    note.md                        requirement questions
    coverage.md                    coverage trace: atoms, dispositions, assertion evidence
testcases/<ISSUE_ID>.feature       Story-level functional scenarios
jira-user-story/<ISSUE_ID>.txt     generated Jira-field representation
test/                              deterministic tests
docs/                              architecture and public-release guidance
```

## 5. Requirement Input Rules

- A fetch creates a dated raw snapshot. Never edit or overwrite the raw file.
- Create a `-formatted.md` copy and convert markup losslessly. Preserve wording, order, values, bullets, and table cells.
- Do not promote generic bold lines into headings. Keep conditional content nested under the condition.
- Requirement interpretation and ambiguity notes belong outside the transcription.
- Read related Stories only when the target Story, AC, or note gives a meaningful reason; verify the relationship against the related source.

## 6. Story-Level Functional Gherkin

The functional feature describes business behavior for manual UAT. It does not encode implementation ownership or automation placement.

Required rules:

1. Place exactly one parent issue-key tag above `Feature:`.
2. Do not place tags on scenarios. In particular, do not add Unit, Integration, E2E, FE, BE, ownership, risk, or TBC tags.
3. Prefix every Scenario and Scenario Outline name with a sequential zero-padded number starting at `01` (for example, `01 Submit an available order`). Keep the sequence continuous in file order.
4. Do not group scenarios into automation tiers.
5. Use only `Given`, `When`, and `Then`. Repeat the parent keyword instead of `And` or `But`.
6. Do not use `Background`; keep each manual scenario independently executable.
7. Use `Given` for the complete entry state and navigation chain needed by a manual tester.
8. Split mutually exclusive states or materially different outcomes.
9. Use observable assertions grounded in the requirement. Do not invent generic edge cases.
10. Keep sources, rationale, architectural analysis, confirmed rules, and open questions out of the `.feature` file.

```gherkin
@DEMO-101
Feature: Submit an order

  Scenario: 01 Customer submits an order with an available item
    Given customer is signed in
    Given customer has an available item in the basket
    When customer submits the order
    Then the order should be created with status "Submitted"
```

## 7. Cross-Story Context

The target Story and its dated formatted snapshot remain the starting point. Follow related Stories when the target Story, AC, or note names them or describes a prerequisite they own. Check the related source before using its rule, cite both sources, and record conflicts or missing decisions in `note.md`. A generated Wiki is optional navigation and synthesis; it is not canonical evidence.

## 8. CLI Safety Classes

| Class | Commands | Authorization rule |
|---|---|---|
| Local read/check | `lint`, validators | Run when relevant |
| Remote read and local snapshot | `fetch` | Resolve the exact issue and preserve dated evidence |
| Local generated write | `export`, skill sync | Inspect scope; preserve curated/manual content |
| Remote write | `upload-user-story`, `create-zephyr-tests` | Execute only when the user explicitly requests the remote change |

`--force` bypasses a quality gate. It does not authorize a remote write. Report every remote record changed and do not retry non-idempotent writes blindly.

Normal Story workflow:

1. `fetch`
2. lossless transcription
3. `functional-test-design` (writes `coverage.md`, reads related Stories)
4. `lint` (checks the feature, `coverage.md`, and overlap with other Stories)
5. independent review of the design in a fresh context
6. `export`
7. optional explicit remote synchronization

Automation analysis and release regression design are separate workflows invoked only when requested.

## 9. Completion Gates

Before reporting repository changes complete, run the applicable checks:

```bash
npm test
npm run skills:check
npm run release:build
git diff --check
```

For each canonical skill, also run the skill structural validator. Mechanical checks do not replace semantic review.

## 10. Public Release Guardrail

Do not publish organization-owned requirements, screenshots, issue keys, internal URLs, field IDs, usernames, credentials, or Git history that ever contained them. Build the public repository from a sanitized snapshot with synthetic examples and configurable adapters. Follow `docs/public-release-checklist.md` before creating or pushing a public remote.
