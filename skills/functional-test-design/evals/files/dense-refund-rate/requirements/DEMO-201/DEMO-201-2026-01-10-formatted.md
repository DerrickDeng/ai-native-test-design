# DEMO-201 — Refund rate report

Synthetic requirement for skill evaluation. Not from any real system.

- Snapshot date: 2026-01-10

## User Story

As a store manager, I want an accurate refund rate so that I can see how many orders are returned.

## Entry point

A signed-in manager opens Reports > Refund rate and picks a date range.

## Acceptance Criteria

### AC 1

Orders are counted as completed, refunded, partially refunded, or cancelled. A partially refunded order counts as refunded in the refund rate but does not add to the Completed count. The Completed count is shown in the report header for the selected date range.

### AC 2

Refund rate = (refunded + partially refunded) / eligible orders, where eligible orders = total orders - cancelled orders. The daily trend chart and the per-category table use the same formula. Cancelled orders are never part of the denominator.

### AC 3

The summary card shows the most recent date that has at least one order within the selected date range. It does not merge the whole range into a single rate. The comparison value is the difference, in percentage points, between the card's rate and the rate of the previous date with orders in that range. It is shown with a sign and one decimal place, for example "+8.3 pp". The previous date with orders is not always the previous calendar day.

### AC 4

When there are no orders in the range, or eligible orders is zero, the rate shows "—" instead of "0%" or "100%". When there is no previous date with orders, the comparison value is hidden.

### AC 5

The rate is shown with one decimal place followed by "%".
