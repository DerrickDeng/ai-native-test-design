@QAD-108
Feature: AI Golden comparison and unknown values

  Scenario: 01 Precision, Recall, and F1 of a single log follow matched, extra, and golden_total
    Given QA is signed in to the local QA Dashboard with the default date Last 14 days
    Given the date window contains only one log, with a comparison of matched 3, extra 1, and golden_total 6
    Given that log belongs to the only group of agent, model, and prompt version
    When QA opens the AI page
    Then Precision should show 75%
    Then Recall should show 50%
    Then Accuracy (F1) should show 60%

  Scenario: 02 Several logs sum the counts first and then calculate accuracy
    Given QA is signed in to the local QA Dashboard with the default date Last 14 days
    Given the date window contains log A, with a comparison of matched 1, extra 0, and golden_total 1
    Given the date window contains log B, with a comparison of matched 1, extra 2, and golden_total 3
    Given both logs belong to the same group of agent, model, and prompt version
    When QA opens the AI page
    Then Precision should show 50%
    Then Recall should show 50%
    Then Accuracy (F1) should show 50%

  Scenario: 03 matched comes from the comparison and is not derived from accepted
    Given QA is signed in to the local QA Dashboard with the default date Last 14 days
    Given the date window contains only one log with 4 generated items, all with accepted=true and edited=false
    Given that log has a comparison of matched 3, extra 1, and golden_total 4
    Given that log belongs to the only group of agent, model, and prompt version
    When QA opens the AI page
    Then Precision should show 75%
    Then Recall should show 75%
    Then Accuracy (F1) should show 75%

  Scenario: 04 F1 shows — when Precision and Recall are both zero
    Given QA is signed in to the local QA Dashboard with the default date Last 14 days
    Given the date window contains only one log, with a comparison of matched 0, extra 2, and golden_total 2
    Given that log belongs to the only group of agent, model, and prompt version
    When QA opens the AI page
    Then Precision should show 0%
    Then Recall should show 0%
    Then Accuracy (F1) should show —

  Scenario Outline: 05 F1 shows — when one component cannot be calculated
    Given QA is signed in to the local QA Dashboard with the default date Last 14 days
    Given the date window contains only one log, with a comparison of matched <matched>, extra <extra>, and golden_total <golden_total>
    Given that log belongs to the only group of agent, model, and prompt version
    When QA opens the AI page
    Then Accuracy (F1) should show —

    Examples:
      | matched | extra | golden_total |
      | 0       | 0     | 2            |
      | 0       | 2     | 0            |

  Scenario: 06 A log without a comparison is not faked as 0% and still contributes to adoption
    Given QA is signed in to the local QA Dashboard with the default date Last 14 days
    Given the date window contains only one log with 2 generated items, both with accepted=true, and no comparison
    Given that log belongs to the only group of agent, model, and prompt version
    When QA opens the AI page
    Then Accuracy (F1) should show — and not 0%
    Then Adoption should show 100%

  Scenario: 07 A log without a comparison does not change the existing accuracy
    Given QA is signed in to the local QA Dashboard with the default date Last 14 days
    Given the date window contains log A, with a comparison of matched 1, extra 3, and golden_total 4
    Given the date window contains log B with no comparison
    Given both logs belong to the same group of agent, model, and prompt version
    When QA opens the AI page
    Then Precision should show 25%
    Then Recall should show 25%
    Then Accuracy (F1) should show 25%

  Scenario: 08 Accuracy is filtered by the date window
    Given QA is signed in to the local QA Dashboard
    Given log A happened 3 days ago, with a comparison of matched 1, extra 0, and golden_total 1
    Given log B happened 20 days ago, with a comparison of matched 1, extra 2, and golden_total 3
    Given both logs belong to the same group of agent, model, and prompt version
    Given QA is on the AI page
    When QA selects Last 7 days for the date
    Then Precision should show 100%
    Then Recall should show 100%
    Then Accuracy (F1) should show 100%
    When QA selects Last 30 days for the date
    Then Precision should show 50%
    Then Recall should show 50%
    Then Accuracy (F1) should show 50%
