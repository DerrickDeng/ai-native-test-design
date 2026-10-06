# Coverage Trace

The coverage trace is the checkable record of what the design covers and why. It lives at `requirements/<ISSUE_ID>/coverage.md`. It stays out of the `.feature` file.

`node bin/jira-sync lint <ISSUE_ID>` reads it. Write the Atoms table and the Related Stories table before drafting scenarios. Write the Assertions table after the feature exists.

## Format

```markdown
# <ISSUE_ID> Coverage Trace

## Related Stories

| Story | Relation | Handling |
|---|---|---|

## Atoms

| Atom | Source | Quote | Disposition | Ref |
|---|---|---|---|---|

## Assertions

| Then | Atom | Type | Basis |
|---|---|---|---|
```

Use `\|` for a literal pipe inside a cell. Prefer a shorter quote that avoids pipes.

### Related Stories

One row for every Story named in the requirement's Related Stories section. Add rows for Stories named in the AC or note.

| Relation | Meaning | Handling column |
|---|---|---|
| `Shared rule` | Another Story owns a rule this Story uses | Say which rule and who owns it. This Story does not retest it. |
| `Prerequisite` | Another Story creates a state this Story starts from | Say which state. Use it in `Given`. |
| `Interaction` | The AC describes behavior that combines both Stories | Say what this Story adds. Assert only that addition. |
| `No impact` | The link exists but changes no test | Say why, after reading the related source. |

### Atoms

| Column | Rule |
|---|---|
| `Atom` | Unique id such as `A01`. |
| `Source` | Section of the source, such as `AC 2`. Use `STORY-KEY:AC 2` for another Story. Use `note` for a confirmed note in `note.md`. |
| `Quote` | Exact text copied from that source. Lint checks it appears there. For a screenshot atom, start the cell with `[image]` and describe what is shown. |
| `Disposition` | One of the four values below. |
| `Ref` | Depends on the disposition. |

| Disposition | Meaning | `Ref` |
|---|---|---|
| `Covered` | At least one scenario asserts it. | empty |
| `Question` | A missing or conflicting rule blocks it. | The question id in `note.md`, such as `Q3`. |
| `Owned elsewhere` | Another Story owns the behavior. | That Story's key. |
| `Not testable` | No observable outcome exists. | The reason. |

### Assertions

One row for every `Then` step in the feature.

| Column | Rule |
|---|---|
| `Then` | `<scenario number>.<index>`. `01.2` is the second `Then` in Scenario `01`. A Scenario Outline counts its template steps once. |
| `Atom` | The `Covered` atom this `Then` proves. |
| `Type` | `Stated` or `Derived`. |
| `Basis` | Empty for `Stated`. For `Derived`, the arithmetic or logic. The `Then` in the feature shows only the value; the working stays here. |

## What lint checks

- Every Story in the requirement's Related Stories section has a row.
- Every quote appears in its source file.
- Every `Covered` atom has at least one assertion.
- No assertion points to an atom that is `Question`, `Owned elsewhere`, or `Not testable`.
- Every `Then` in the feature has a row, and every row points to a real `Then`.
- Every `Question` ref exists in `note.md`.
- No `Inferred` assertion. Every `Derived` assertion has a `Basis`.
- A `Then` that explains its value (", i.e. 3/4", "rather than", "because", or the Chinese equivalents) gets a `then-rationale` warning. Move the working to `Basis`. A negation the requirement states, such as "should not show 0%", may stay.
- Text that names a scenario number the feature does not have. A mention such as "scenario 05" in `coverage.md` is an error. In `note.md` it is a warning, and a mention that follows an issue key ("DEMO-204 scenario 02") is skipped as another Story's scenario.

Lint reads numbered mentions only. If you delete a scenario, also reread any sentence in `note.md` or `coverage.md` that describes its behavior in words.

Lint cannot judge whether the atoms are complete or whether a quote really supports its assertion. That is the job of the independent review.

## Worked example

Synthetic requirement:

```text
### AC 1
Standard delivery is free for orders of 50 or more; otherwise the fee is 5. The fee is shown in the basket summary and in the order confirmation. Express delivery is not affected by this threshold and always costs 8.

### AC 2
The fee is rounded appropriately.
```

Atoms:

| Atom | Source | Quote | Disposition | Ref |
|---|---|---|---|---|
| A01 | AC 1 | Standard delivery is free for orders of 50 or more | Covered | |
| A02 | AC 1 | otherwise the fee is 5 | Covered | |
| A03 | AC 1 | The fee is shown in the basket summary | Covered | |
| A04 | AC 1 | and in the order confirmation | Covered | |
| A05 | AC 1 | Express delivery is not affected by this threshold | Covered | |
| A06 | AC 1 | always costs 8 | Covered | |
| A07 | AC 2 | The fee is rounded appropriately | Question | Q1 |

`A07` gets a question because "appropriately" does not say how. No scenario is written for it.

Assertions:

| Then | Atom | Type | Basis |
|---|---|---|---|
| 01.1 | A01 | Stated | |
| 01.1 | A03 | Stated | |
| 02.1 | A02 | Derived | Total 49 is below 50, so "otherwise" applies and the fee is 5. |
| 02.1 | A03 | Stated | |
| 03.1 | A04 | Stated | |
| 04.1 | A05 | Stated | |
| 04.1 | A06 | Stated | |

Scenarios 01 and 02 assert the fee in the basket summary, so each `Then` proves two atoms and appears in two rows. Scenario 03 checks the order confirmation. Scenario 04 is an Outline over totals 49 and 50. Both rows are needed for it, because the two totals are what make "not affected" and "always" observable.

## Completeness is not a count

Do not judge the design by scenario count. A design is complete when every atom has a disposition and every `Then` has a quote behind it.
