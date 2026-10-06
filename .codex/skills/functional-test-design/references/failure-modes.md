# Functional Test Design Failure Modes

Use this reference during complex review or when coverage appears complete mechanically but may be semantically weak.

| Failure mode | Observable symptom | Required response |
|---|---|---|
| Completeness inflation | Scenarios cover common errors, permissions, or validations absent from the Story | Remove unsupported scenarios and record a question only when an explicit behavior cannot be completed without the missing rule. |
| Related-Story leakage | Assertions come from a nearby Story without an evidence-bearing relationship or clear shared rule | Remove the imported behavior or document the relationship and evidence before using it. |
| Weak observable result | A `Then` checks only that an element exists although the AC specifies a value, order, state, message, or persistence | Assert the explicit business result at the point where it becomes observable. |
| Automation concerns in functional truth | Scenario tags or wording encode Unit, Integration, E2E, FE, BE, ownership, or mocks | Remove placement concerns from the feature and route them to automation coverage analysis. |
| Hidden assumption | A scenario supplies an actor, trigger, expected value, or branch not present in evidence | Stop the affected scenario and add a concrete question to `note.md`. |
| False execution claim | The completion report says tests passed when only generation or lint occurred | Report design and lint status separately from product execution evidence. |
| Lost atom | One sentence has several claims and the scenario proves only the first | Split the sentence into atoms with quotes. Give each atom its own disposition and assertion. |
| Dropped negation | "Does not", "not affected", or "not counted" has no scenario | Add a scenario whose data would expose the wrong behavior. Assert the absence where it would appear. |
| Consistency claimed, one surface tested | "Same as" or "uses the same definition" is covered on one screen only | Add one `Then` for each surface the text names. |
| Unobservable selection | "Latest", "previous", or "default" is tested with a single candidate | Use data with at least two candidates so the wrong choice changes the result. |
| Chosen expected value | The expected result reflects the designer's preference, or two engineers could disagree | Mark the atom `Question`. Write no scenario until the text decides. |
| Underived number | A calculated value has no visible arithmetic | Recompute from the stated formula and record the arithmetic as `Basis`. |
| Retested owned rule | A rule owned by a related Story is asserted again as the main point | Mark the atom `Owned elsewhere`. Assert only what this Story adds. |
| Ignored relation | A Story in Related Stories was never opened, or a state it owns is assumed | Read the related source, fill the Related Stories row, and cite it. |
| Cross-Story conflict resolved silently | Two Stories define a term or rule differently and the design picks one | Record both sources in `note.md` and mark the affected atom `Question`. |
| Owner's reasons enumerated | Two scenarios hide or show the same element for two different reasons that a related Story owns (for example a delivery window and a "Final sale" flag) | Keep one representative state for each outcome. Leave the owner's reasons to the owner's feature. |
| Rationale in the Then | A `Then` carries the arithmetic ("should show 75%, i.e. 3/4") or a contrast the requirement does not state ("not the average of the runs") | Keep the expected value only. Move the arithmetic to `Basis` in the coverage trace. Keep a negation only when the requirement states it. |
| Duplicate scenarios | Two scenarios share an action and outcome and differ only in an irrelevant `Given` | Merge them, or use a Scenario Outline. Keep both only if each can fail alone. |
| Padding | Scenarios exist to raise the count and no atom needs them | Remove them. Every `Then` must trace to a quote. |
| Stale text after an edit | `note.md` or `coverage.md` says a behavior is covered, but the scenario was removed, merged, or renumbered | After every change to the feature, reread the text that describes it. Fix or delete the claim. |
| Review started, not awaited | The report says a fresh-context review is under way, or omits its result | Wait for the reviewer. Report "not run" until it returns. |
| Self-confirmed review | The author checked the design in the same context and found nothing | Run the independent review with no access to the atom list. |

Do not add a new failure mode for a one-off wording preference. Promote a rule to `SKILL.md` only when it must change every design run.
