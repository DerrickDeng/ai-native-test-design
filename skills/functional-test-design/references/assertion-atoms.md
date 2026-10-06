# Assertion Atoms

Use this reference in the decomposition step. An atom is the smallest claim in the requirement that can be true or false on its own.

## How to split

Take each sentence of the Story description, Acceptance Criteria, note, and referenced screenshot. Ask of each part:

> Could an implementation satisfy this part and still violate another part of the same sentence?

If yes, they are separate atoms. Every atom needs an exact quote from the source (see [coverage trace](coverage-trace.md)).

Do not split below what an observer can tell apart. Do not add atoms that no quote supports.

## Wording that hides atoms

These are cues found in the requirement text. Each cue tells you where to look for extra atoms. None of them permits a scenario the text does not support.

| Cue in the text | Atoms to look for | How to make it testable |
|---|---|---|
| Negation: "does not", "not", "never", "no longer", "does not add to" | The thing that must stay absent or unchanged | Use a state where the wrong behavior would show up. Assert the absence at the place where it would appear. |
| Formula or calculation | Each term, the denominator, and any excluded term | Choose data where every term changes the result. Compute the expected value from the stated formula and show the arithmetic as the `Basis`. |
| "same as", "consistent", "also applies to", "uses the same definition" | One atom for each surface the text names | One `Then` per named surface. List surfaces only from the text. |
| Named empty or zero states | Each state the text names separately | Keep them separate when the text gives each its own name or result. |
| "latest", "previous", "first", "top N", "default" | The selection rule and the baseline rule | Use data with at least two candidates so the selection is observable. Include a gap or tie only when the text mentions it. |
| "when X, show Y" | The stated branch and any stated opposite | Cover the opposite branch only when the text states it. Do not assume an "otherwise". |
| "at least", "up to", "exactly", thresholds | The stated threshold value | Test the stated value. Test a value on the other side only when the rule defines that side. |
| Value, unit, label, symbol, placeholder, precision | The exact displayed form | Assert the text as displayed, not "a value is shown". |
| Sort, group, limit, order | The order key and direction | Use data that makes a wrong order visible. |
| Reload, persist, "remains", "saved" | Where and when the state must still hold | Add a step that moves past the point of loss, then assert. |
| List or table of rows | One atom per row | Rows with the same action and assertion shape become one Scenario Outline. |
| "not guaranteed", "may differ" | The clause is a limit, not a promise | Put the situation in the test data. Assert only the stated rule. |
| "see STORY-KEY", "defined in" | A boundary with another Story | Mark the atom `Owned elsewhere`. Assert here only what this Story adds. |

## Things that are not atoms

- Generic validation, error handling, permissions, security, accessibility, or performance the text never mentions.
- Common product behavior the text does not state.
- Implementation details, layers, mocks, or ownership by team.

If you feel one of these is missing, record a question in `note.md`. Do not write a scenario.

## Derived versus inferred

An assertion is `Derived` when a stated rule and stated data force the result. Arithmetic and direct logical consequences qualify.

An assertion is `Inferred` when you had to choose. Ask:

> Could two reasonable engineers read this text and write different expected results?

If yes, it is a question, not an assertion. `Inferred` assertions must not appear in the feature.

## Test data is not behavior

You may choose concrete numbers, names, or dates so that a scenario can run. That is test design. It is not an invented requirement.

You may not choose the expected result. The expected result must come from a quote (`Stated`) or from a stated rule applied to your data (`Derived`).
