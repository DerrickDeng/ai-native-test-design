# DEMO-206 — Earn loyalty points

Synthetic requirement for skill evaluation. Not from any real system.

- Snapshot date: 2026-01-10

## User Story

As a member, I want to earn points on my purchases so that I can see my rewards grow.

## Entry point

A signed-in member places an order and later opens the account page.

## Acceptance Criteria

### AC 1

A member earns 1 point for every 10 spent on the order, rounded down to whole points. Shipping fees are not counted as spend.

### AC 2

Points are credited to the member's balance when the order status becomes "Delivered". Before that, the balance does not change.

### AC 3

Once credited, the points earned appear on the account page and on the order receipt.

### AC 4

A cancelled order earns no points.

## Related Stories

DEMO-207
