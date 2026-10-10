# Example Build: QA Dashboard

This page records one Requirement Wiki build. It is an example of the workflow, not a fixed project scope or a general performance benchmark.

## Build and retrieval record

The [QA Dashboard Wiki](../generated/qa-dashboard-wiki/index.md) was compiled from an empty target using the 13 current English inputs: 1 index and 6 cross-Story topic pages. The inputs are the current formatted Stories for QAD-101 to QAD-108 and 5 notes. The full paths and SHA-256 hashes are in [build-manifest.json](../build-manifest.json). The build ran on OpenViking 0.4.22 as task `cmp_69ef1baa0a7c4bbaac0c8adfe5cc436e`, took about 902 seconds, and reported 176,232 tokens; the native snapshot OID is `037d347e7b8eb6060a755ac002aedd3c9c3215e6`. The Markdown export is committed, so it can be read right after cloning.

These Stories are requirement drafts written from the local QA Dashboard; they are not Jira exports or evidence of a production deployment. The constructed older version of QAD-103 stays in the root folder for testing incremental updates later and was not an input to this build; simulated execution data, answers, and earlier Wiki pages were not inputs either. The Wiki text separates explicit rules, inferences, and open questions, and links back to its sources through `viking://` URIs.

All 7 exported pages were checked: the 71 source links resolve to the 13 distinct inputs, and the 7 links between pages are valid. For 9 targeted questions, the expected topic page ranked first 7 times and in the top 3 all 9 times; see the [retrieval record](../retrieval-review.json). Two questions ranked their target page second or third, so retrieval should still read several candidate pages and go back to the original Story or note to confirm a key decision. This is a small sample check, not a blind test by an independent BDD implementor.

An earlier build of this Wiki was in Chinese. The requirements were translated to English and the Wiki was rebuilt from them; the retrieval questions were translated with the same intent and run again on the new build.


## Example commands

Run from the repository root after setting up the local service:

```sh
wiki/tools/ov.sh tree viking://resources/qa-dashboard-sources -L 2 -o json
wiki/tools/ov.sh tree viking://resources/qa-dashboard-wiki -L 2 -o json
wiki/tools/ov.sh read viking://resources/qa-dashboard-wiki/index.md -o json
wiki/.venv/bin/python wiki/tools/export.py qa-dashboard-wiki
```

The export helper currently accepts this example Wiki name only. The committed export is readable without the native database. Older simulation material under the ignored `wiki/evaluation/` folder was not an input to this build.

Return to the [Requirement Wiki guide](../README.md).
