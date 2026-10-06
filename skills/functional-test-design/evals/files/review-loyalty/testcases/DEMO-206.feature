@DEMO-206
Feature: Earn loyalty points

  Scenario: 01 Member is credited when the order is delivered
    Given customer is signed in
    Given member has a balance of 0 points
    Given member has placed an order with 40 of items and no shipping fee
    When the order status becomes "Delivered"
    Then the account page should show a balance of "4" points

  Scenario: 02 Shipping fee is not counted as spend
    Given customer is signed in
    Given member has a balance of 0 points
    Given member has placed an order with 40 of items and a shipping fee of 10
    When the order status becomes "Delivered"
    Then the account page should show a balance of "4" points

  Scenario: 03 Points are rounded down
    Given customer is signed in
    Given member has a balance of 0 points
    Given member has placed an order with 39 of items and no shipping fee
    When the order status becomes "Delivered"
    Then the account page should show a balance of "3" points

  Scenario: 04 Balance does not change before delivery
    Given customer is signed in
    Given member has a balance of 0 points
    Given member has placed an order with 40 of items and the order status is "Packed"
    When member opens the account page
    Then the account page should show a balance of "0" points

  Scenario: 05 Order receipt shows the points earned
    Given customer is signed in
    Given member has a delivered order with 40 of items and no shipping fee
    When member opens the order receipt
    Then the order receipt should show a points earned line

  Scenario: 06 Member earns points on an order that includes shipping
    Given customer is signed in
    Given member has a balance of 0 points
    Given member has placed an order with 60 of items and a shipping fee of 10
    When the order status becomes "Delivered"
    Then the account page should show a balance of "7" points

  Scenario: 07 Points are credited once the order has shipped
    Given customer is signed in
    Given member has a balance of 0 points
    Given member has placed an order with 40 of items and no shipping fee
    When the order status becomes "Shipped"
    Then the account page should show a balance of "4" points

  Scenario: 08 Returning member is credited when the order is delivered
    Given customer "Alex" is signed in
    Given member has a balance of 0 points
    Given member has placed an order with 40 of items and no shipping fee
    When the order status becomes "Delivered"
    Then the account page should show a balance of "4" points

  Scenario: 09 Checkout rejects points above the balance
    Given customer is signed in
    Given member has a balance of 120 points
    When member applies 130 points at checkout
    Then the checkout should reject the points
