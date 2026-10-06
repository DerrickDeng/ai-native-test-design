@DEMO-204
Feature: Return eligibility

  Scenario: 01 Item inside the return window is eligible
    Given customer is signed in
    Given customer has an order item delivered 29 days ago
    When customer opens the order items
    Then the item should show "Eligible for return"

  Scenario: 02 Item outside the return window is not eligible
    Given customer is signed in
    Given customer has an order item delivered 31 days ago
    When customer opens the order items
    Then the item should show "Not eligible for return"

  Scenario: 03 Final sale item is never eligible
    Given customer is signed in
    Given customer has a "Final sale" order item delivered 1 day ago
    When customer opens the order items
    Then the item should show "Not eligible for return"
