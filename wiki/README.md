# Requirement Wiki

An OpenViking-based workflow that organizes Stories and notes into a Requirement Wiki. It helps people and agents find relevant requirements, locate the original Stories, and retrieve context for test design and automation.

## What it does

- Compiles requirements into topic pages that connect rules across Stories.
- Maintains an index and links between pages so agents can find the context they need.
- Links each rule to its source Story or note for verification.
- Keeps stated rules, inferences, conflicts, and open questions distinct.
- Uses OpenViking for search and page retrieval, and exports Wiki pages as Markdown.

## How it works

The Story files and notes in [`requirements/`](../requirements/) remain the source of truth. OpenViking compiles them into a derived Wiki using the [LLM Wiki skill](skills/llm-wiki/SKILL.md).

An agent starts with a business question, searches the Wiki, and reads the relevant topic pages. Before using a rule, it checks the cited Story or note and its source version. The Wiki supplies context; it does not add requirements or decide expected test results.

The UI automation project uses the [requirement-context-retrieval skill](https://github.com/DerrickDeng/ai-native-ui-automation/tree/main/.claude/skills/requirement-context-retrieval) for this process. It uses native OpenViking retrieval first and searches the local Markdown only if the service or command fails.

## Basic use

The bundled setup uses Python 3.12 and OpenViking 0.4.22. Run these commands from the repository root:

```sh
wiki/tools/install.sh
wiki/tools/bootstrap-auth.sh
wiki/tools/start.sh
```

The setup uses the machine's Codex OAuth for online compilation. The service runs on `127.0.0.1:19330`; the compile bot runs on port `19331`. Keep `start.sh` running while compiling or querying.

In another terminal, check the service and inspect your source and Wiki collections. Replace the URI placeholders with your configured collection URIs:

```sh
wiki/tools/ov.sh health -o json
wiki/tools/ov.sh tree '<source-collection-uri>' -L 2 -o json
wiki/tools/ov.sh tree '<wiki-uri>' -L 2 -o json
wiki/tools/ov.sh read '<wiki-uri>/index.md' -o json
```

Use the LLM Wiki skill with OpenViking Compile to build or update the Wiki from your selected sources. Check the returned task status before retrying. Review the generated pages, source links, and unresolved questions before exporting them.

When requirements change, compare source paths and hashes in the build manifest, update the source collection, and refresh the affected Wiki content. The included `export.py` helper currently targets the bundled example; adjust its target when exporting another Wiki.

## Folder guide

| Path | Purpose |
|---|---|
| [`tools/`](tools/) | Installation, local configuration, service startup, CLI access, and Markdown export |
| [`skills/llm-wiki/`](skills/llm-wiki/) | Instructions for compiling connected knowledge pages and maintaining the index |
| [`generated/`](generated/) | Markdown exports that people and agents can read without the service |
| [`build-manifest.json`](build-manifest.json) | Source paths and hashes for the bundled build |
| [`retrieval-review.json`](retrieval-review.json) | Retrieval checks for the bundled example |

The local runtime, credentials, models, and database are ignored by Git. A fresh clone includes the committed Markdown export, but not a running or populated OpenViking service.

## Usage boundaries

Verify important Wiki conclusions against their original sources. Treat changed or missing sources and unresolved conflicts as gaps to resolve. The Wiki never writes back to requirement files.

Online compilation sends the selected source content to the model provider. Review the material before importing it. Give agents that only retrieve requirements read-only access to the required collection.

## Example

See the [example build record](examples/build-record.md) for a generated Wiki, source manifest, retrieval results, and example commands.
