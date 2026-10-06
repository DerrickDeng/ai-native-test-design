@QAD-101
Feature: Shared filters and execution data scope

  Scenario: 01 Default filters on first entry to the Dashboard
    Given QA is signed in to the local QA Dashboard
    When QA enters the Dashboard for the first time
    Then the date filter should show "Last 14 days"
    Then the Application, Region, and Environment filters should all show "All"

  Scenario: 02 The date dropdown offers only four preset options
    Given QA is signed in to the local QA Dashboard
    When QA opens the date dropdown
    Then the date dropdown should contain only the four options "Last 7 days", "Last 14 days", "Last 30 days", and "Last 90 days"
    Then the date filter should not offer custom date input

  Scenario Outline: 03 The date option limits the time range of execution data
    Given the local QA Dashboard has received the following runs, all with the same Application, Region, and Environment
      | run id  | date        |
      | run-D3  | 3 days ago  |
      | run-D10 | 10 days ago |
      | run-D20 | 20 days ago |
      | run-D40 | 40 days ago |
    Given QA is signed in and has opened the execution page
    When QA selects "<date_option>" in the date dropdown
    Then Recent runs should list only "<visible_runs>"

    Examples:
      | date_option  | visible_runs                      |
      | Last 7 days  | run-D3                            |
      | Last 14 days | run-D3, run-D10                   |
      | Last 30 days | run-D3, run-D10, run-D20          |
      | Last 90 days | run-D3, run-D10, run-D20, run-D40 |

  Scenario: 04 After selecting one Application, every block on the execution page uses the same scope
    Given the local QA Dashboard has received the following runs, where test "auth.spec.ts > sign in" belongs to project "chromium" and test "scan.spec.ts > scan code" belongs to project "ios"
      | run id  | Application | Region | Environment | date       | test                     | status |
      | run-W1  | Web         | EU     | staging     | 6 days ago | auth.spec.ts > sign in   | failed |
      | run-M1  | Mobile      | EU     | staging     | 5 days ago | scan.spec.ts > scan code | passed |
      | run-W2  | Web         | US     | staging     | 4 days ago | auth.spec.ts > sign in   | passed |
      | run-M2  | Mobile      | US     | prod        | 3 days ago | scan.spec.ts > scan code | failed |
      | run-W3  | Web         | EU     | prod        | 2 days ago | auth.spec.ts > sign in   | failed |
      | run-M3  | Mobile      | US     | prod        | 1 day ago  | scan.spec.ts > scan code | passed |
    Given QA is signed in and has opened the execution page with date "Last 14 days" and Application, Region, and Environment all set to "All"
    When QA selects "Web" for Application
    Then the summary should show Passed 0 and Failed 1
    Then the trend should contain data for 6, 4, and 2 days ago and no data for 5, 3, and 1 days ago
    Then the project groups should contain only "chromium" and not "ios"
    Then Recent runs should list only run-W1, run-W2, run-W3
    Then the failure list should contain test "sign in" in auth.spec.ts and not test "scan code" in scan.spec.ts
    Then the flaky ranking should contain test "sign in" in auth.spec.ts and not test "scan code" in scan.spec.ts

  Scenario: 05 When several dimensions are selected, they restrict every block on the execution page together
    Given the local QA Dashboard has received the following runs, where test "auth.spec.ts > sign in" belongs to project "chromium" and test "scan.spec.ts > scan code" belongs to project "ios"
      | run id  | Application | Region | Environment | date       | test                     | status |
      | run-W1  | Web         | EU     | staging     | 6 days ago | auth.spec.ts > sign in   | failed |
      | run-M1  | Mobile      | EU     | staging     | 5 days ago | scan.spec.ts > scan code | passed |
      | run-W2  | Web         | US     | staging     | 4 days ago | auth.spec.ts > sign in   | passed |
      | run-M2  | Mobile      | US     | prod        | 3 days ago | scan.spec.ts > scan code | failed |
      | run-W3  | Web         | EU     | prod        | 2 days ago | auth.spec.ts > sign in   | failed |
      | run-M3  | Mobile      | US     | prod        | 1 day ago  | scan.spec.ts > scan code | passed |
    Given QA is signed in and has opened the execution page with date "Last 14 days" and Application, Region, and Environment all set to "All"
    When QA selects "Web" for Application, "EU" for Region, and "staging" for Environment
    Then the summary should show Passed 0 and Failed 1
    Then the trend should contain data for 6 days ago and no data for 5, 4, 3, 2, and 1 days ago
    Then the project groups should contain only "chromium" and not "ios"
    Then Recent runs should list only run-W1
    Then the failure list should contain test "sign in" in auth.spec.ts and not test "scan code" in scan.spec.ts
    Then the flaky ranking should contain neither test "sign in" in auth.spec.ts nor test "scan code" in scan.spec.ts

  Scenario: 06 After selecting All, that dimension no longer restricts the data
    Given the local QA Dashboard has received the following runs
      | run id  | Application | Region | Environment | date       |
      | run-W1  | Web         | EU     | staging     | 6 days ago |
      | run-M1  | Mobile      | EU     | staging     | 5 days ago |
      | run-W2  | Web         | US     | staging     | 4 days ago |
      | run-M2  | Mobile      | US     | prod        | 3 days ago |
      | run-W3  | Web         | EU     | prod        | 2 days ago |
    Given QA is signed in and has opened the execution page with date "Last 14 days" and Application set to "Web"
    When QA selects "All" for Application
    Then Recent runs should list run-W1, run-M1, run-W2, run-M2, run-W3

  Scenario: 07 Changing one filter keeps the other filters
    Given the local QA Dashboard has received the following runs
      | run id  | Application | Region | Environment | date       |
      | run-W1  | Web         | EU     | staging     | 6 days ago |
      | run-M1  | Mobile      | EU     | staging     | 5 days ago |
      | run-W2  | Web         | US     | staging     | 4 days ago |
      | run-M2  | Mobile      | US     | prod        | 3 days ago |
      | run-W3  | Web         | EU     | prod        | 2 days ago |
    Given QA is signed in and has opened the execution page with date "Last 30 days", Application "Web", Region "EU", and Environment "All"
    When QA changes Environment to "staging"
    Then the date should still be "Last 30 days", Application should still be "Web", Region should still be "EU", and Environment should be "staging"
    Then Recent runs should list only run-W1

  Scenario: 08 The filter state is kept after switching Dashboard tabs
    Given the local QA Dashboard has received the following runs
      | run id  | Application | Region | Environment | date       |
      | run-W1  | Web         | EU     | staging     | 6 days ago |
      | run-M1  | Mobile      | EU     | staging     | 5 days ago |
      | run-W2  | Web         | US     | staging     | 4 days ago |
      | run-M2  | Mobile      | US     | prod        | 3 days ago |
      | run-W3  | Web         | EU     | prod        | 2 days ago |
    Given QA is signed in and has opened the execution page with date "Last 30 days", Application "Web", Region "EU", and Environment "All"
    When QA switches to the AI tab and then back to the execution page
    Then the date should still be "Last 30 days", Application should still be "Web", Region should still be "EU", and Environment should still be "All"
    Then Recent runs should list only run-W1, run-W3

  Scenario: 09 A late response to an earlier filter request does not overwrite the result of the latest selection
    Given the local QA Dashboard has received the following runs
      | run id  | Application | Region | Environment | date       |
      | run-W1  | Web         | EU     | staging     | 6 days ago |
      | run-M1  | Mobile      | EU     | staging     | 5 days ago |
      | run-W2  | Web         | US     | staging     | 4 days ago |
      | run-M2  | Mobile      | US     | prod        | 3 days ago |
      | run-W3  | Web         | EU     | prod        | 2 days ago |
    Given QA is signed in and has opened the execution page with date "Last 14 days" and Application, Region, and Environment all set to "All"
    Given the tester has delayed the data request for Application "Mobile" so that it returns after requests sent later
    When QA selects "Mobile" for Application and then immediately selects "Web" for Application
    When the response to the "Mobile" request returns after the response to the "Web" request
    Then the Application filter should show "Web"
    Then Recent runs should list only run-W1, run-W2, run-W3

  Scenario Outline: 10 The API accepts the boundary values of the days range
    Given the local QA Dashboard API is running
    When the tester sends a request with days "<days>" to the execution data endpoint of the Dashboard API
    Then the API should accept the request

    Examples:
      | days |
      | 1    |
      | 180  |

  Scenario: 11 After selecting a shorter date range, every block on the execution page uses the same date range
    Given the local QA Dashboard has received the following runs, all with the same Application, Region, and Environment, where tests "auth.spec.ts > sign in" and "pay.spec.ts > pay" belong to different projects
      | run id  | date        | project  | test                   | status |
      | run-D20 | 20 days ago | chromium | auth.spec.ts > sign in | failed |
      | run-D10 | 10 days ago | chromium | auth.spec.ts > sign in | passed |
      | run-D10 | 10 days ago | firefox  | pay.spec.ts > pay      | failed |
      | run-D3  | 3 days ago  | chromium | auth.spec.ts > sign in | failed |
    Given QA is signed in and has opened the execution page with date "Last 30 days" and Application, Region, and Environment all set to "All"
    When QA selects "Last 7 days" for the date
    Then the trend should contain data for 3 days ago and no data for 10 or 20 days ago
    Then the project groups should contain only "chromium" and not "firefox"
    Then the failure list should contain test "sign in" in auth.spec.ts and not test "pay" in pay.spec.ts
    Then the flaky ranking should not contain test "sign in" in auth.spec.ts
