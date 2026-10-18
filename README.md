# AI-Native Test Design

Agent skills that turn a Jira Story into reviewed BDD test cases. The agent
records requirement gaps as questions and does not guess. It also recommends a
test layer for each case and builds release regression suites. A Requirement
Wiki gives the agent related rules from other Stories. In the evaluation, the
agent passed 96% of the checks with the skill and 85% without it. The skills
run in Claude Code, Codex, and Gemini CLI.

![AI-Native Test Design overview](docs/assets/overview.svg)

## What is inside

| Part                                                                 | Input                                                | Output                                                         |
| -------------------------------------------------------------------- | ---------------------------------------------------- | -------------------------------------------------------------- |
| [functional-test-design](skills/functional-test-design/)             | Story, AC, notes, and screenshots                    | BDD `.feature` cases, requirement questions, and an AC trace   |
| [automation-coverage-analysis](skills/automation-coverage-analysis/) | Functional cases and the implementation architecture | A recommended test layer for each case                         |
| [regression-suite-design](skills/regression-suite-design/)           | The functional cases of a module                     | User journeys for release regression, plus high-risk scenarios |
| [jira cli](skills/testcase-agent-cli/)                               | A Story ID                                           | Downloaded requirements; cases uploaded to Jira and Zephyr     |
| [Requirement Wiki](wiki/README.md)                                   | Stories and notes                                    | Linked topic pages that agents search for context              |

## Contents

1. [How it works](#how-it-works)
2. [Quick start](#quick-start)
3. [Requirement Wiki](#requirement-wiki)
4. [Evaluation](#evaluation)
5. [Further reading](#further-reading)

## How it works

Three rules guide the skills:

- Requirements guide test design.
- Implementation architecture guides automation test layers.
- Business risk guides regression selection.

Each case links to the AC that it covers. A trace check finds each AC that has
no case. Then an independent review checks the cases against the source text.

A human stays in control:

- The human answers the requirement questions. The agent does not fill a gap
  with a guess.
- The human approves the cases before they go to Jira.
- Each Jira or Zephyr write is an explicit command. Local checks never write to
  Jira.

The reviewed BDD cases are the input for
[ai-native-ui-automation](https://github.com/DerrickDeng/ai-native-ui-automation).

## Quick start

1. Clone the repository. Open it in Claude Code, Codex, or Gemini CLI.
2. Give the agent the Story ID and the reviewed requirement files. Include the
   referenced screenshots and related Stories.
3. Ask the agent to run the skill. For example:

   ```text
   Use functional-test-design to design BDD test cases for <Story ID>
   from its reviewed requirement files. Record requirement issues and
   questions, then validate and independently review the output.
   ```

4. Review the cases. Answer the requirement questions.

For test layer recommendations, give the agent the functional cases and the
implementation architecture. For release regression, give it the functional
cases of the module.

To try the workflow without Jira, use the synthetic
[online-store example](examples/online-store/) and the
[five-minute walkthrough](docs/usage.md#five-minute-walkthrough). The
[usage guide](docs/usage.md) has the local checks, the commands, and the Jira
setup.

## Requirement Wiki

A business rule often spans several Stories and notes. The Requirement Wiki
uses OpenViking to put them into linked topic pages with an index.

- **Find requirements:** Search with a business question. Get the related
  Stories and rules.
- **Connect rules:** Get the prerequisites and the behavior that other Stories
  describe.
- **Give context to agents:** Test design and UI automation agents get only the
  related requirements, not the full collection.

Each rule links to its source Story or note. So the agent can check the context
against the original requirement.

The [Requirement Wiki guide](wiki/README.md) has the setup, the search, and an
example build.

## Evaluation

On 2026-10-09, each task ran 3 times with the skill and 3 times without it. The
percentage is the share of checks that passed. The sample is small, so it is
not a task success rate.

| Skill                  | Without the skill | With the skill      | Sample           |
| ---------------------- | ----------------- | ------------------- | ---------------- |
| functional-test-design | 141 / 165 (85%)   | **159 / 165 (96%)** | 4 tasks × 3 runs |

The skill adds the most on the hard tasks. It records each gap and conflict as
a question. It does not retest rules that another Story owns. Its independent
review quotes the source text.

`npm test` runs 66 deterministic tests for the CLI, lint, AC trace, and Jira
adapter. All pass.

The [evaluation results](docs/evaluation/results.md) give each task, the agent
time, and the limits.

## Further reading

- [Usage guide](docs/usage.md): Jira setup, commands, checks, and skill
  maintenance.
- [Requirement Wiki](wiki/README.md): requirement search and context for
  agents.
- [Architecture](docs/architecture.md): responsibilities and data flow.
- [Repository rules](AGENTS.md): source requirements and quality checks.
- [Public-release checklist](docs/public-release-checklist.md): how to prepare
  a clean public snapshot.
