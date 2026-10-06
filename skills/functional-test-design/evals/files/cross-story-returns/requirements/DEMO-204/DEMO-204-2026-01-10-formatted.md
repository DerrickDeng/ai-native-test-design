# DEMO-204 — Return eligibility

Synthetic requirement for skill evaluation. Not from any real system.

- Snapshot date: 2026-01-10

## User Story

As a customer, I want to know whether an item can be returned so that I do not try to return something that is refused.

## Entry point

A signed-in customer opens Orders > an order > Order items.

## Acceptance Criteria

### AC 1

An order item is eligible for return within 30 days of delivery. After 30 days it is not eligible.

### AC 2

Items marked "Final sale" are never eligible for return.

### AC 3

Each item shows the label "Eligible for return" or "Not eligible for return".
