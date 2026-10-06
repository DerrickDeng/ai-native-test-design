@QAD-107
Feature: AI adoption and human editing cost

  Scenario: 01 Adoption and unchanged adoption of a single log follow accepted and edited
    Given QA is signed in to the local QA Dashboard with the default date Last 14 days
    Given the date window contains only one normal log with items human review records, with 5 generated items
    Given 2 of them have accepted=true and edited=false, and 1 has accepted=true and edited=true
    Given 1 more has accepted=false and edited=false, and 1 has accepted=false and edited=true
    When QA opens the AI page
    Then Adoption should show 60%
    Then Unchanged adoption should show 40%

  Scenario: 02 Several logs sum the counts first and then divide
    Given QA is signed in to the local QA Dashboard with the default date Last 14 days
    Given the date window contains log A with 1 generated item, which has accepted=true and edited=false
    Given the date window contains log B with 4 generated items, of which 1 has accepted=true and edited=true and the other 3 have accepted=false
    When QA opens the AI page
    Then Adoption should show 40%
    Then Unchanged adoption should show 20%

  Scenario: 03 The page shows — when the window has only a log with no items and no generated
    Given QA is signed in to the local QA Dashboard with the default date Last 14 days
    Given the date window contains only one log with no items and no explicit generated
    Given that log has a comparison with matched 2, extra 2, and golden_total 4
    When QA opens the AI page
    Then Adoption should show —
    Then Unchanged adoption should show —
    Then Accuracy (F1) should show 50%

  Scenario: 04 A log with no items and no generated does not change adoption
    Given QA is signed in to the local QA Dashboard with the default date Last 14 days
    Given the date window contains log A with 4 generated items, of which 2 have accepted=true and edited=false and 2 have accepted=false
    Given the date window also contains log B with no items and no explicit generated
    When QA opens the AI page
    Then Adoption should show 50%
    Then Unchanged adoption should show 50%

  Scenario: 05 A high adoption is shown together with a lower Accuracy (F1)
    Given QA is signed in to the local QA Dashboard with the default date Last 14 days
    Given the date window contains only one log with 2 generated items, both with accepted=true and edited=false
    Given that log has a comparison with matched 1, extra 3, and golden_total 1
    When QA opens the AI page
    Then Adoption should show 100%
    Then Unchanged adoption should show 100%
    Then Accuracy (F1) should show 40%

  Scenario: 06 AI statistics are filtered by the date window
    Given QA is signed in to the local QA Dashboard
    Given log A happened 3 days ago with 2 generated items, both with accepted=true and edited=false
    Given log B happened 20 days ago with 2 generated items, both with accepted=false
    Given QA is on the AI page
    When QA selects Last 7 days for the date
    Then Adoption should show 100%
    Then Unchanged adoption should show 100%
    When QA selects Last 30 days for the date
    Then Adoption should show 50%
    Then Unchanged adoption should show 50%

  Scenario Outline: 07 Application, Region, and Environment do not change AI statistics
    Given QA is signed in to the local QA Dashboard with the default date Last 14 days
    Given the date window contains only one log with 2 generated items, of which 1 has accepted=true and edited=false and the other has accepted=false
    Given the "<dimension>" dropdown has options other than All
    Given QA is on the AI page, where Adoption shows 50% and Unchanged adoption shows 50%
    When QA selects an option other than All for "<dimension>"
    Then Adoption should still show 50%
    Then Unchanged adoption should still show 50%

    Examples:
      | dimension   |
      | Application |
      | Region      |
      | Environment |
