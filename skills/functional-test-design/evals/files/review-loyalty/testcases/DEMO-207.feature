@DEMO-207
Feature: Redeem loyalty points

  Scenario: 01 Member redeems points in a multiple of 100
    Given customer is signed in
    Given member has 250 points
    When member redeems 200 points at checkout
    Then the order total should be reduced by "10"

  Scenario: 02 Member cannot redeem more points than the balance
    Given customer is signed in
    Given member has 250 points
    When member tries to redeem 300 points at checkout
    Then the redemption should be refused
