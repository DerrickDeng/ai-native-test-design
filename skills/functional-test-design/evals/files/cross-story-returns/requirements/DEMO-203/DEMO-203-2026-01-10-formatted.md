# DEMO-203 — Return shipping label

Synthetic requirement for skill evaluation. Not from any real system.

- Snapshot date: 2026-01-10

## User Story

As a customer, I want to print a return shipping label so that I can send an item back.

## Entry point

A signed-in customer opens Orders > an order > Order items.

## Acceptance Criteria

### AC 1

The Print label button is shown only for items that are eligible for return (returnable within 14 days of delivery, see DEMO-204).

### AC 2

Clicking Print label downloads a PDF named "return-label-<order number>.pdf".

### AC 3

A label can be printed up to 3 times for each item. On the 4th attempt the page shows the message "Label limit reached" and no file is downloaded.

## Related Stories

DEMO-204, DEMO-205
