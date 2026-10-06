@QAD-103
Feature: Flaky ranking and this execution's results

  Scenario Outline: 01 Test identity is defined by file, full title path, and project together
    Given the local QA Dashboard has received the following two run records, which belong to the same test
      | run id | start time | file         | full title path      | project  | status |
      | run-1  | 4 days ago | auth.spec.ts | sign in > succeeds   | chromium | failed |
      | run-3  | 2 days ago | auth.spec.ts | sign in > succeeds   | chromium | failed |
    Given the local QA Dashboard has also received run-2, started 3 days ago, with status passed, file "<file_b>", full title path "<path_b>", and project "<project_b>"
    Given QA is signed in and has opened the execution page with date "Last 14 days" and Application, Region, and Environment all set to "All"
    When QA views the flaky ranking
    Then the flaky ranking should contain no tests

    Examples:
      | file_b       | path_b              | project_b |
      | pay.spec.ts  | sign in > succeeds  | chromium  |
      | auth.spec.ts | register > succeeds | chromium  |
      | auth.spec.ts | sign in > succeeds  | firefox   |

  Scenario: 02 History is sorted by run start time from oldest to newest, not by push order
    Given the local QA Dashboard has received the following runs in the push order shown, and both tests belong to the same project
      | push order | run id | start time | auth.spec.ts > sign in | pay.spec.ts > pay |
      | 1          | run-1  | 4 days ago | passed                 | passed            |
      | 2          | run-3  | 2 days ago | passed                 | passed            |
      | 3          | run-2  | 3 days ago | failed                 | failed            |
      | 4          | run-4  | 1 day ago  | failed                 | passed            |
    Given QA is signed in and has opened the execution page with date "Last 14 days" and Application, Region, and Environment all set to "All"
    When QA views the flaky ranking
    Then the flaky ranking should list test "sign in" in auth.spec.ts, then test "pay" in pay.spec.ts

  Scenario: 03 A test with exactly 3 history records enters the ranking, and a test with only 2 does not
    Given the local QA Dashboard has received the following runs, both tests belong to the same project, and "-" means the run has no record for that test
      | run id | start time | auth.spec.ts > sign in | pay.spec.ts > pay |
      | run-1  | 3 days ago | passed                 | passed            |
      | run-2  | 2 days ago | failed                 | failed            |
      | run-3  | 1 day ago  | passed                 | -                 |
    Given QA is signed in and has opened the execution page with date "Last 14 days" and Application, Region, and Environment all set to "All"
    When QA views the flaky ranking
    Then the flaky ranking should contain test "sign in" in auth.spec.ts and should not contain test "pay" in pay.spec.ts

  Scenario: 04 The eligibility check also counts skipped records as history
    Given the local QA Dashboard has received the following runs, and test "auth.spec.ts > sign in" belongs to project "chromium"
      | run id | start time | auth.spec.ts > sign in |
      | run-1  | 3 days ago | passed                 |
      | run-2  | 2 days ago | failed                 |
      | run-3  | 1 day ago  | skipped                |
    Given QA is signed in and has opened the execution page with date "Last 14 days" and Application, Region, and Environment all set to "All"
    When QA views the flaky ranking
    Then the flaky ranking should contain test "sign in" in auth.spec.ts

  Scenario: 05 A test with no valid records after removing skipped does not enter the ranking
    Given the local QA Dashboard has received the following runs, and test "auth.spec.ts > sign in" belongs to project "chromium"
      | run id | start time | auth.spec.ts > sign in |
      | run-1  | 3 days ago | skipped                |
      | run-2  | 2 days ago | skipped                |
      | run-3  | 1 day ago  | skipped                |
    Given QA is signed in and has opened the execution page with date "Last 14 days" and Application, Region, and Environment all set to "All"
    When QA views the flaky ranking
    Then the flaky ranking should not contain test "sign in" in auth.spec.ts

  Scenario: 06 Skipped does not count as a valid record or in the denominator
    Given the local QA Dashboard has received the following runs, both tests belong to the same project, and "-" means the run has no record for that test
      | run id | start time | auth.spec.ts > sign in | pay.spec.ts > pay |
      | run-1  | 5 days ago | passed                 | passed            |
      | run-2  | 4 days ago | skipped                | passed            |
      | run-3  | 3 days ago | failed                 | failed            |
      | run-4  | 2 days ago | -                      | failed            |
      | run-5  | 1 day ago  | -                      | passed            |
    Given QA is signed in and has opened the execution page with date "Last 14 days" and Application, Region, and Environment all set to "All"
    When QA views the flaky ranking
    Then the flaky ranking should list test "sign in" in auth.spec.ts, then test "pay" in pay.spec.ts

  Scenario: 07 A flaky record is in the pass class and counts in the numerator
    Given the local QA Dashboard has received the following runs, both tests belong to the same project, and "-" means the run has no record for that test
      | run id | start time | auth.spec.ts > sign in | pay.spec.ts > pay |
      | run-1  | 4 days ago | passed                 | passed            |
      | run-2  | 3 days ago | flaky                  | failed            |
      | run-3  | 2 days ago | passed                 | passed            |
      | run-4  | 1 day ago  | -                      | passed            |
    Given QA is signed in and has opened the execution page with date "Last 14 days" and Application, Region, and Environment all set to "All"
    When QA views the flaky ranking
    Then the flaky ranking should list test "pay" in pay.spec.ts, then test "sign in" in auth.spec.ts

  Scenario: 08 When scores are equal, the test with more valid records ranks first
    Given the local QA Dashboard has received the following runs, where sign in and pay have the same score and different numbers of valid records, both tests belong to the same project, and "-" means the run has no record for that test
      | run id | start time | auth.spec.ts > sign in | pay.spec.ts > pay |
      | run-1  | 5 days ago | passed                 | passed            |
      | run-2  | 4 days ago | failed                 | failed            |
      | run-3  | 3 days ago | skipped                | passed            |
      | run-4  | 2 days ago | skipped                | passed            |
      | run-5  | 1 day ago  | skipped                | -                 |
    Given QA is signed in and has opened the execution page with date "Last 14 days" and Application, Region, and Environment all set to "All"
    When QA views the flaky ranking
    Then test "pay" in pay.spec.ts should rank before test "sign in" in auth.spec.ts in the flaky ranking

  Scenario Outline: 09 A test that always failed or always passed does not enter the ranking
    Given the local QA Dashboard has received 3 runs, and the statuses of test "auth.spec.ts > sign in" in those 3 runs by start time are "<history>"
    Given QA is signed in and has opened the execution page with date "Last 14 days" and Application, Region, and Environment all set to "All"
    When QA views the flaky ranking
    Then the flaky ranking should not contain test "sign in" in auth.spec.ts

    Examples:
      | history                |
      | failed, failed, failed |
      | passed, passed, passed |

  Scenario: 10 The recent history in the ranking is shown by start time from oldest to newest
    Given the local QA Dashboard has received the following runs in the push order shown, and test "auth.spec.ts > sign in" belongs to project "chromium"
      | push order | run id | start time | auth.spec.ts > sign in |
      | 1          | run-2  | 2 days ago | passed                 |
      | 2          | run-3  | 1 day ago  | failed                 |
      | 3          | run-1  | 3 days ago | passed                 |
    Given QA is signed in and has opened the execution page with date "Last 14 days" and Application, Region, and Environment all set to "All"
    When QA views the recent history of "sign in" in the flaky ranking
    Then the recent history should show passed, passed, failed in that order

  Scenario: 11 The latest-run flaky count and the flaky ranking score are different metrics
    Given the local QA Dashboard has received the following runs, all four tests belong to the same project, and "-" means the run has no record for that test
      | run id | start time | auth.spec.ts > sign in | pay.spec.ts > pay | cart.spec.ts > cart | scan.spec.ts > scan code |
      | run-1  | 3 days ago | passed                 | -                 | -                   | -                        |
      | run-2  | 2 days ago | failed                 | -                 | -                   | -                        |
      | run-3  | 1 day ago  | passed                 | flaky             | failed              | passed                   |
    Given QA is signed in and has opened the execution page with date "Last 14 days" and Application, Region, and Environment all set to "All"
    When QA views the summary and the flaky ranking
    Then the flaky ranking should contain test "sign in" in auth.spec.ts and should not contain test "pay" in pay.spec.ts
    Then the summary Flaky should be 1
    Then the summary pass rate should be "75%"

  Scenario: 12 Skipped does not take part in comparing adjacent valid records
    Given the local QA Dashboard has received the following runs, and test "auth.spec.ts > sign in" belongs to project "chromium"
      | run id | start time | auth.spec.ts > sign in |
      | run-1  | 3 days ago | passed                 |
      | run-2  | 2 days ago | skipped                |
      | run-3  | 1 day ago  | passed                 |
    Given QA is signed in and has opened the execution page with date "Last 14 days" and Application, Region, and Environment all set to "All"
    When QA views the flaky ranking
    Then the flaky ranking should not contain test "sign in" in auth.spec.ts
