# Cross-Story Context

A Story is tested inside a product, not alone. Use this reference before decomposing atoms and again before writing scenarios.

## Which Stories to read

Read every Story that appears in any of these:

1. The requirement's Related Stories section. This is explicit evidence. Read each one. Do not wait for another reason.
2. The AC, description, or `note.md` of the target Story, when it names another Story or describes a state another Story creates.
3. Existing `testcases/*.feature` files of those Stories.

For each related Story, open its latest formatted snapshot and its `note.md`. Read the sections that touch the shared behavior. Read the whole Story when you cannot tell which sections matter.

A generated Wiki, when the repository has one, may help you find related Stories. It is navigation, not evidence. Return to the Story source before using any rule.

Do not read Stories only because they look nearby. Do not import a rule you have not checked in its source.

## Classify each relation

Record one row per Story in the coverage trace's Related Stories table.

| Relation | Test here? | What to do |
|---|---|---|
| `Shared rule` | No | Mark the atom `Owned elsewhere`. Cite the owner. |
| `Prerequisite` | No | Use the state in `Given`. Do not assert the other Story's behavior. |
| `Interaction` | Only the addition | Assert what this Story's AC adds when the two combine. |
| `No impact` | No | Write why, after reading the source. |

## One representative state for each outcome

An interaction scenario shows that this Story reacts to the owner's rule. It does not show every reason the rule can give.

If a button is shown for eligible items and hidden for ineligible ones, write one scenario for each outcome: one eligible item, one ineligible item. Any ineligible item will do. Do not add a second hidden-button scenario for each reason the owner lists (a delivery window, a "Final sale" flag). Those reasons are the owner's rule. The owner's feature tests them.

A second scenario is justified only when this Story's AC gives a different result for it.

## One owner for each rule

The owner is the Story whose AC defines the rule. Only the owner writes a scenario whose main purpose is that rule.

Another Story may still show the rule in passing. Its scenario asserts its own outcome and does not repeat the owner's check.

If two Stories define the same rule, do not pick one silently. Record the overlap in `note.md`. Write the scenario in this Story only if the rule is stated in this Story's own AC and the owner has no scenario for it yet.

## Read the other Story for conflicts

While reading, compare the other Story's rules against the target Story's.

- Same term with different meaning, value, or scope.
- A rule in one Story that makes an AC of the other impossible or redundant.
- A state the target Story assumes that the other Story never creates.

Record each finding as a question in `note.md`. Cite both sources. Do not resolve it by choosing one.

## Check for existing overlap

Before writing scenarios, look at existing feature files of the related Stories.

- Find scenarios with the same action and the same outcome as one you plan to write.
- If one exists in the owner's file, mark the atom `Owned elsewhere` and do not write it again.
- If the existing scenario covers only part of the atom, write only the missing part.

`node bin/jira-sync lint <ISSUE_ID>` warns about scenarios whose action and outcome match one in another Story. Treat each warning as a question to answer, not as noise.

## Within one Story

Two scenarios in the same file need a reason to both exist. Ask of each:

> If this scenario fails, which other scenario would not?

If the answer is "none", the second scenario adds nothing. Merge them or turn them into a Scenario Outline. If the answer is "a different atom", keep both.
