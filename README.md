# AI-Native Test Design

Agent workflows that turn Jira Stories into BDD test cases, recommend automation test layers, and build release regression suites. The skills run in Claude Code, Codex, and Gemini CLI.

Requirements guide test design. Implementation architecture guides automation layers. Business risk guides regression selection.

A Requirement Wiki connects requirements across Stories and supplies context to agents for test design and UI automation.

## What it does

| Skill / Tool | What it does |
|---|---|
| [Functional Test Design](skills/functional-test-design/) | Reads Stories and related requirements, organizes test points, records requirement issues, and writes BDD `.feature` cases with traceability checks and independent review. |
| [Automation Coverage Analysis](skills/automation-coverage-analysis/) | Recommends automation test layers based on each feature's implementation architecture. |
| [Regression Suite Design](skills/regression-suite-design/) | Combines existing functional test scenarios into representative user journeys for release regression. Adds high-risk scenarios based on business risk. |
| [Jira CLI](skills/testcase-agent-cli/) | Downloads Jira requirements and referenced screenshots, uploads BDD cases to Story tickets, and creates or updates Zephyr tests. |
| [Requirement Wiki](wiki/README.md) | Uses OpenViking to organize Stories into a Wiki that helps agents find requirements and retrieve context. |

## How to use

1. Clone the repository and open it in Claude Code, Codex, or Gemini CLI.
2. Provide the Story ID and reviewed requirement files, including any referenced screenshots or related Stories.
3. Ask the agent to run the skill for your task. Review the generated cases and resolve any requirement questions.

For example:

```text
Use functional-test-design to design BDD test cases for <Story ID>
from its reviewed requirement files. Record requirement issues and
questions, then validate and independently review the output.
```

For automation layer recommendations, provide existing functional scenarios and implementation architecture. For release regression, provide the module's functional tests.

See the [usage guide](docs/usage.md) for local checks, example commands, and Jira setup.

## Requirement Wiki: context across Stories

Business rules often span several Stories and notes. The Requirement Wiki uses OpenViking to organize them into connected topic pages with an index.

- **Find requirements:** search by a business question and locate the relevant Stories and rules.
- **Connect related rules:** retrieve prerequisites and behavior described in other Stories.
- **Supply agent context:** give test design and automation agents the relevant requirements without reading the entire collection.

Each rule links to its source Story or note, so agents can check the retrieved context against the original requirement.

See the [Requirement Wiki guide](wiki/README.md) for setup, retrieval, and an example build.

## Examples and evaluation

The repository includes synthetic requirements and tests for trying the workflows. Start with the [online-store example](examples/online-store/) or read the [example walkthrough](docs/usage.md#five-minute-walkthrough).

See the [evaluation results](docs/evaluation/results.md) for recorded agent runs, sample sizes, and limitations.

## Further reading

- [Usage guide](docs/usage.md): Jira setup, commands, validation, and skill maintenance.
- [Requirement Wiki](wiki/README.md): requirement retrieval and context for agents.
- [Architecture](docs/architecture.md): responsibilities and data flow.
- [Repository rules](AGENTS.md): source requirements and quality checks.
- [Public-release checklist](docs/public-release-checklist.md): preparing a sanitized public snapshot.
