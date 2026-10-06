# Independent Review

The author of a design shares its blind spots. A check run in the same context tends to confirm the design. The review below runs in a fresh context that does not see the author's inventory.

## When to run

Run it for every new or changed Story feature, after lint passes.

If a fresh context is not available, do not skip silently. Report "independent review not run" and say why.

Wait for the reviewer to finish. If your tool starts it in the background, wait for the completion notice or read its output before you write the report. A reviewer that has not returned is "not run". Do not report a design as reviewed, or as final, on the strength of a reviewer you started but did not hear back from.

## What the reviewer receives

Give the reviewer only:

- the latest formatted requirement of the Story;
- `requirements/<ISSUE_ID>/note.md`;
- the latest formatted snapshot and `note.md` of each related Story;
- the `.feature` file;
- the feature files of related Stories, for overlap checks.

Do not give it `coverage.md`, the atom list, or your reasoning. The reviewer must build its own view.

The reviewer reads and reports. It does not edit files.

## Reviewer prompt

Adapt this text to the tool in use:

```text
You are reviewing a functional test design. You did not write it.
Read the requirement, notes, related Stories, and the .feature file listed below.
Do not assume the feature is complete.

Do these steps in order.

1. From the requirement text alone, list every independently checkable claim.
   Split a sentence when one part could be violated while another holds.
   Pay attention to negations, formulas, "same as" clauses, empty states,
   selection rules (latest, previous, default), thresholds, displayed formats,
   and ordering.
2. For each claim, find the scenario and `Then` that proves it.
   Report claims with no proof as Missing.
   A claim that a related Story owns is not Missing here. Do not ask for
   scenarios that test another Story's rule or list its reasons or boundaries.
3. For each `Then`, find the requirement text that supports its expected result.
   Report results with no support as Unsupported.
   Report results that need a choice the text does not make as Guessed.
4. Report pairs of scenarios where failure of one would never be
   distinguished from failure of the other as Duplicate.
5. For each related Story, check whether the feature retests that Story's rule,
   uses a state that Story does not create, or conflicts with it.
   Report these as CrossStory.
6. Report a `Then` that is weaker than the requirement text as Weak,
   for example it checks that a value is shown when the text gives the value.

For every finding give: the class, the scenario number if any,
an exact quote from the source, and one sentence on why it matters.
Do not report generic risks the text never mentions.
If a class has no findings, say so.
```

## How the author handles findings

Save the reviewer's returned text unchanged in `requirements/<ISSUE_ID>/review.md`. Later readers can then check what the reviewer said and what you did with it. Overwrite the file when you run the review again.

Treat each finding as a claim to verify, not as a fact.

1. Open the quoted source. Confirm the quote exists and reads as the reviewer says.
2. If it holds, fix the feature and the coverage trace. Run lint again.
3. If it does not hold, do not change the design. Write one line saying why.
4. If the text is truly unclear, record a question in `note.md` and mark the atom `Question`.

Never delete a finding without a stated reason. Report every accepted and rejected finding in the final report.

A reviewer can also be wrong or can invent requirements. A finding with no valid quote is rejected.

## Limits

This review finds what a second reader can find from the text. It does not prove product behavior. Do not describe reviewed scenarios as executed.
