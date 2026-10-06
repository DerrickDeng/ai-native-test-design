# DEMO-207 — Redeem loyalty points

Synthetic requirement for skill evaluation. Not from any real system.

- Snapshot date: 2026-01-10

## User Story

As a member, I want to redeem points at checkout so that I can pay less.

## Entry point

A signed-in member with points opens Checkout > Payment.

## Acceptance Criteria

### AC 1

Points can be redeemed only in multiples of 100. Each 100 points reduces the order total by 5.

### AC 2

A member cannot redeem more points than the member's balance.
