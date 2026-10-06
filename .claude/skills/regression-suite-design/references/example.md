# Small three-file example

This only demonstrates the format and the choices; it is not a requirement of any module. Assume that `01 Update and reopen draft` in the source file `draft.feature` explicitly requires editing a draft, echoing the input immediately, and keeping the name after reopening, and that every step below can be reused from the source tests. The example has no external Story ID, so it uses `—` and does not invent one.

## regression-suite.feature

```gherkin
@regression @draft-management
Feature: Draft management release regression

  Scenario: [DRAFT-E2E-01] Save and reopen draft, existing draft, updated name
    Given an editable draft exists
    When user changes the draft name to "Release draft"
    When user saves the draft
    When user reopens the draft
    Then the draft name should display "Release draft"
```

## mapping.md

| Feature | Story | Source Scenario ID / Name | Source Location | Covered | Regression Case ID(s) | Rationale |
|---|---|---|---|---|---|---|
| Draft editing | — | 01 Update and reopen draft | draft.feature | Partial | DRAFT-E2E-01 | Keeps the check that the name persists after reopening, which guards against losing saved content; the immediate input echo is not included, so this is Partial. |

| Status | Source scenarios |
|---|---:|
| Partial | 1 |

| Section | Logical cases | Example executions |
|---|---:|---:|
| Main E2E journeys | 1 | 1 |
| Targeted high-risk validations | 0 | 0 |
| Total | 1 | 1 |

## jira-description.md

| Type | Regression Case ID | Regression Case | Covered Functions |
|---|---|---|---|
| Main E2E journey | DRAFT-E2E-01 | Save and reopen draft, existing draft, updated name | 1. After saving and reopening the draft, the name shows Release draft. |

## How the Thens were chosen

In this example, no extra Then is kept for showing the name right after typing: this regression protects saving and reloading, and the ordinary input echo stays in the functional tests. A successful reopen does not prove the input was echoed while typing, so the mapping says Partial.

If the deleted assertion were a duplicate persistence check in another case, the current case would still fully carry the same verification goal, and coverage could stay the same.

Derived calculation example: keep a system-calculation assertion only when the source rule explicitly defines the relation below; do not override a derived value by hand and then claim the automatic calculation was verified.

```gherkin
When user enters "3" in the Quantity field for an item priced "20.00"
Then the Total field should display "60.00"
```

These are step fragments, not a complete feature. An order module might order its comma-separated title branches as customer type, payment method, delivery method, and put dependent settings such as a gift-wrap option under the delivery method. Other modules use their own branch dimensions.
