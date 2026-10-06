# Coverage Evidence Contract

Use one of these statuses for every coverage claim:

| Status | Meaning |
|---|---|
| Verified | Current test code, test result, CI artifact, trace, or report was inspected and supports the claim |
| Claimed | A person or document says coverage exists, but implementation or execution evidence was not inspected |
| Unknown | Relevant evidence was unavailable or could not be interpreted |
| Missing | Sufficient evidence was inspected and the behavior is not covered |

Record the evidence locator: repository path and test name, CI job or artifact, report section, or explicit statement source.

Keep these fields independent:

- `Recommended layer`: where the behavior should primarily be tested.
- `Evidence status`: what is known about current implementation.
- `Execution status`: whether a specific test run passed, failed, or was not run.

Never convert a recommendation into `Verified`, infer developer test coverage from a functional scenario, or use UI automation to hide unavailable lower-layer evidence.
