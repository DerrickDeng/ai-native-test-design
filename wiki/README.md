# QA Dashboard Requirements Wiki

This folder holds the OpenViking tooling and the derived knowledge that live in the same repository as `ai-native-test-design`. The Story snapshots and notes in the root [`requirements/`](../requirements/) folder are the source of truth; the Wiki lets the BDD implementor look across Stories, and it never writes back to the requirements.

## Current state

The [QA Dashboard Wiki](generated/qa-dashboard-wiki/index.md) was compiled from an empty target using the 13 current English inputs: 1 index and 6 cross-Story topic pages. The inputs are the current formatted Stories for QAD-101 to QAD-108 and 5 notes. The full paths and SHA-256 hashes are in [build-manifest.json](build-manifest.json). The build ran on OpenViking 0.4.22 as task `cmp_69ef1baa0a7c4bbaac0c8adfe5cc436e`, took about 902 seconds, and reported 176,232 tokens; the native snapshot OID is `037d347e7b8eb6060a755ac002aedd3c9c3215e6`. The Markdown export is committed, so it can be read right after cloning.

These Stories are requirement drafts written from the local QA Dashboard; they are not Jira exports or evidence of a production deployment. The constructed older version of QAD-103 stays in the root folder for testing incremental updates later and was not an input to this build; simulated execution data, answers, and earlier Wiki pages were not inputs either. The Wiki text separates explicit rules, inferences, and open questions, and links back to its sources through `viking://` URIs.

All 7 exported pages were checked: the 71 source links resolve to the 13 distinct inputs, and the 7 links between pages are valid. For 9 targeted questions, the expected topic page ranked first 7 times and in the top 3 all 9 times; see the [retrieval record](retrieval-review.json). Two questions ranked their target page second or third, so retrieval should still read several candidate pages and go back to the original Story or note to confirm a key decision. This is a small sample check, not a blind test by an independent BDD implementor.

An earlier build of this Wiki was in Chinese. The requirements were translated to English and the Wiki was rebuilt from them; the retrieval questions were translated with the same intent and run again on the new build.

## Folders and use

- `tools/`: local configuration, install, start, CLI, and Markdown export.
- `skills/llm-wiki/`: the Wiki compile Skill for OpenViking 0.4.22.
- `.venv/`, `.local/`, `models/`, `data/`: the local runtime, credentials, model, and database, all ignored by Git.
- `generated/`: the readable Markdown export of the Wiki, committed to Git; the runtime database stays in `data/` and is ignored.
- `evaluation/`: older simulation material kept for later evaluation, ignored by Git, and not an input to this build.

The service listens on `127.0.0.1:19330` (with the compile bot on `19331`) and uses the machine's Codex OAuth. On a new machine, run `wiki/tools/install.sh`, then `wiki/tools/bootstrap-auth.sh` explicitly, then `wiki/tools/start.sh`. Compile requires the bot, so always start the service with `start.sh`. To inspect the service, the inputs, and the Wiki:

```sh
wiki/tools/ov.sh health -o json
wiki/tools/ov.sh tree viking://resources/qa-dashboard-sources -L 2 -o json
wiki/tools/ov.sh tree viking://resources/qa-dashboard-wiki -L 2 -o json
wiki/tools/ov.sh read viking://resources/qa-dashboard-wiki/index.md -o json
```

After the requirements change, first compare the paths and SHA-256 hashes in [build-manifest.json](build-manifest.json) to see what changed, then update the OpenViking source collection and compile for that scope. Compile with the current `llm-wiki` Skill and ask it to synthesize by cross-Story topic, cite the original text, keep rules apart from unknowns, and never treat a snapshot date as deployment evidence. When compile returns a task ID, check its status before doing anything else; do not retry blindly after a CLI timeout. When it finishes, reread the affected pages, check the citations and open questions, and then export:

```sh
wiki/.venv/bin/python wiki/tools/export.py qa-dashboard-wiki
```

## Boundaries

The Wiki is a derived layer and cannot replace `requirements/`. Every `viking://` citation must be read back from the original Story or note. The online model receives the input content, so do not import unreviewed company material. The OpenViking MCP includes write tools; when the BDD implementor is formally connected, limit it to read-only tools and the target URI.

The Markdown export travels with the repository; the OpenViking database, credentials, and runtime libraries are not in Git, so a fresh clone does not come with a queryable local service. The public snapshot build includes the committed `wiki/` files (the export, tools, Skill, manifest, and retrieval record) and the root requirements, but never the ignored local state.
