@QAD-102
Feature: Execution pass rate and empty data

  Scenario: 01 The summary shows separate counts for passed, failed, flaky, and skipped
    Given the local QA Dashboard has received the following run, where 3 flaky tests failed on the first attempt and passed on retry, and 2 failed tests still failed after retry
      | run id | date      | project  | passed | failed | flaky | skipped |
      | run-A  | 1 day ago | chromium | 5      | 2      | 3     | 4       |
    Given QA is signed in and has opened the execution page with date "Last 14 days" and Application, Region, and Environment all set to "All"
    When QA views the summary
    Then the summary Passed should be 5, not including the 3 flaky tests
    Then the summary Flaky should be 3
    Then the summary Failed should be 2 and Skipped should be 4

  Scenario: 02 The pass rate counts flaky in the numerator and leaves skipped out of the denominator
    Given the local QA Dashboard has received the following run
      | run id | date      | project  | passed | failed | flaky | skipped |
      | run-A  | 1 day ago | chromium | 5      | 2      | 3     | 4       |
    Given QA is signed in and has opened the execution page with date "Last 14 days" and Application, Region, and Environment all set to "All"
    When QA views the summary
    Then the summary pass rate should be "80%"

  Scenario: 03 The daily trend uses the same pass-rate definition
    Given the local QA Dashboard has received the following runs
      | run id | date       | project  | passed | failed | flaky | skipped |
      | run-B  | 3 days ago | chromium | 5      | 2      | 1     | 2       |
      | run-A  | 1 day ago  | chromium | 5      | 2      | 3     | 4       |
    Given QA is signed in and has opened the execution page with date "Last 14 days" and Application, Region, and Environment all set to "All"
    When QA views the trend
    Then the trend pass rate should be "75%" for 3 days ago and "80%" for 1 day ago

  Scenario: 04 The project groups use the same pass-rate definition
    Given the local QA Dashboard has received the following run, where run-C is one report that contains both the chromium and firefox projects
      | run id | date      | project  | passed | failed | flaky | skipped |
      | run-C  | 1 day ago | chromium | 4      | 5      | 1     | 2       |
      | run-C  | 1 day ago | firefox  | 2      | 0      | 2     | 6       |
    Given QA is signed in and has opened the execution page with date "Last 14 days" and Application, Region, and Environment all set to "All"
    When QA views the project groups
    Then the pass rate should be "50%" for project "chromium" and "100%" for project "firefox"

  Scenario: 05 The summary uses only the latest date with data
    Given the local QA Dashboard has received the following runs
      | run id | date       | project  | passed | failed | flaky | skipped |
      | run-B  | 3 days ago | chromium | 5      | 2      | 1     | 2       |
      | run-A  | 1 day ago  | chromium | 5      | 2      | 3     | 4       |
    Given QA is signed in and has opened the execution page with date "Last 14 days" and Application, Region, and Environment all set to "All"
    When QA views the summary
    Then the summary pass rate should be "80%"
    Then the summary pass rate should not equal the pass rate calculated from the merged counts of 3 days ago and 1 day ago (14 divided by 18 after merging)

  Scenario: 06 No pass-rate change is shown when the scope has no earlier data
    Given the local QA Dashboard has received the following runs, where the run from 40 days ago is outside the "Last 14 days" scope
      | run id | date        | project  | passed | failed | flaky | skipped |
      | run-Z  | 40 days ago | chromium | 3      | 1      | 0     | 0       |
      | run-A  | 1 day ago   | chromium | 5      | 2      | 3     | 4       |
    Given QA is signed in and has opened the execution page with date "Last 14 days" and Application, Region, and Environment all set to "All"
    When QA views the summary
    Then the summary should not show a pass-rate change

  Scenario: 07 The pass rate shows a dash when executed is zero
    Given the local QA Dashboard has received the following run, in which every test is skipped
      | run id | date      | project  | passed | failed | flaky | skipped |
      | run-S  | 1 day ago | chromium | 0      | 0      | 0     | 5       |
    Given QA is signed in and has opened the execution page with date "Last 14 days" and Application, Region, and Environment all set to "All"
    When QA views the summary
    Then the summary pass rate should show "—" and not "0%" or "100%"

  Scenario: 08 The pass rate shows a dash when the scope has no data
    Given the local QA Dashboard has received only the following run, and the run from 40 days ago is outside the "Last 14 days" scope
      | run id | date        | project  | passed | failed | flaky | skipped |
      | run-Z  | 40 days ago | chromium | 3      | 1      | 0     | 0       |
    Given QA is signed in and has opened the execution page with date "Last 14 days" and Application, Region, and Environment all set to "All"
    When QA views the summary
    Then the summary pass rate should show "—" and not "0%" or "100%"

  Scenario: 09 Each Recent runs row calculates the pass rate from that run's own counts
    Given the local QA Dashboard has received the following runs, both on the same day
      | run id | date      | project  | passed | failed | flaky | skipped |
      | run-R1 | 1 day ago | chromium | 5      | 2      | 1     | 2       |
      | run-R2 | 1 day ago | chromium | 5      | 2      | 3     | 4       |
    Given QA is signed in and has opened the execution page with date "Last 14 days" and Application, Region, and Environment all set to "All"
    When QA views Recent runs
    Then the pass rate should be "75%" on the run-R1 row and "80%" on the run-R2 row
