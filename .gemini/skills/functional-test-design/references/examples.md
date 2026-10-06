# Functional Test Design Examples

Use these examples as shape anchors, not as reusable business requirements.

## Explicit success behavior

Evidence:

```text
An authenticated customer with an available item in the basket can submit the order. The created order has status "Submitted".
```

Result:

```gherkin
@DEMO-101
Feature: Submit an order

  Scenario: 01 Customer submits an order with an available item
    Given customer is authenticated
    Given customer has an available item in the basket
    When customer submits the order
    Then an order should be created with status "Submitted"
```

The actor, entry state, action, and expected status all come from the evidence. No generic payment, permission, or unavailable-item scenario is added.

## Explicit data rows with one behavior shape

Evidence:

| Delivery method | Fee |
|---|---:|
| Standard | 0 |
| Express | 8 |

Result:

```gherkin
  Scenario Outline: 01 Display the fee for an available delivery method
    Given customer is reviewing delivery options
    When customer selects "<delivery_method>"
    Then the delivery fee should be "<fee>"

    Examples:
      | delivery_method | fee |
      | Standard        | 0   |
      | Express         | 8   |
```

Use an Outline because each explicit row has the same action and assertion structure and both columns affect the scenario.

## Missing expected outcome

Evidence:

```text
The customer can select weekend delivery.
```

The requirement does not state availability conditions, fee, delivery-date effect, confirmation, or failure behavior. Do not invent an assertion. Record a question such as:

```text
- [ ] What observable result confirms that weekend delivery was selected successfully?
```

Stop that scenario until the expected result is confirmed; continue designing unrelated behaviors that have complete evidence.
