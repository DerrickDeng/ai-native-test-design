# DEMO-202 — Choose a delivery method

Synthetic requirement for skill evaluation. Not from any real system.

- Snapshot date: 2026-01-10

## User Story

As a customer, I want to choose a delivery method at checkout so that my order arrives the way I prefer.

Notes from the Story description: small baskets (under 10) pay a standard delivery fee of 3.

## Entry point

A signed-in customer with items in the basket opens Checkout > Delivery.

## Acceptance Criteria

### AC 1

Standard delivery is free. Express delivery costs 8.

### AC 2

The customer can select weekend delivery.

### AC 3

Delivery fees are rounded appropriately.

### AC 4

After the customer selects a method, the order summary shows the method name and its fee.

### AC 5

Express delivery is available for orders placed before 14:00.

### AC 6

The order summary shows an estimated delivery date.
