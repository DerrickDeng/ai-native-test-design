@QAD-104
Feature: Report ingestion and data identity

  Scenario: 01 Push a suites-format JSON report without an HTML bundle
    Given the data pusher holds a valid ingest token
    Given the local QA Dashboard has no run for report "run-104-a" yet
    Given report "run-104-a" is in the suites format of the Playwright JSON reporter, contains tests "user can sign in" and "user can sign out", and has an execution date within the current filter scope
    When the data pusher pushes report "run-104-a" with the ingest token and without an HTML bundle
    When QA signs in to the local QA Dashboard and clicks View report for that run in Recent runs
    Then Recent runs should show 1 run for report "run-104-a"
    Then Test details should list "user can sign in" and "user can sign out"

  Scenario: 02 Keep each test's status, project, duration, retry count, and error message
    Given the data pusher holds a valid ingest token
    Given the local QA Dashboard has no run for report "run-104-b" yet
    Given report "run-104-b" is in the suites format of the Playwright JSON reporter and has an execution date within the current filter scope
    Given in report "run-104-b", test "user can sign in" has status passed, project chromium, duration 800 ms, 0 retries, and no error
    Given in report "run-104-b", test "user can sign out" has status failed, project firefox, duration 1200 ms, 2 retries, and error message "Timeout 30000ms exceeded"
    When the data pusher pushes report "run-104-b" with the ingest token and without an HTML bundle
    When QA signs in to the local QA Dashboard and clicks View report for that run in Recent runs
    Then the Result of test "user can sign in" should match the pushed status "passed", and the Result of test "user can sign out" should match the pushed status "failed"
    Then the Project of test "user can sign in" should be "chromium", and the Project of test "user can sign out" should be "firefox"
    Then the Duration of test "user can sign in" should match the pushed duration of 800 ms, and the Duration of test "user can sign out" should match the pushed duration of 1200 ms
    Then the Retries of test "user can sign in" should be 0, and the Retries of test "user can sign out" should be 2
    Then the Error of test "user can sign out" should show "Timeout 30000ms exceeded"

  Scenario: 03 Push the files format of the report embedded in index.html
    Given the data pusher holds a valid ingest token
    Given the local QA Dashboard has no run for report "run-104-c" yet
    Given report "run-104-c" is in the files format of the report embedded in index.html and has an execution date within the current filter scope
    When the data pusher pushes report "run-104-c" with the ingest token
    When QA signs in to the local QA Dashboard and views Recent runs
    Then Recent runs should show 1 run for report "run-104-c"

  Scenario: 04 Pushing the same report again does not add a duplicate run
    Given the data pusher holds a valid ingest token
    Given the local QA Dashboard has no run for report "run-104-d" yet
    Given report "run-104-d" is in the suites format of the Playwright JSON reporter, contains tests "user can sign in" and "user can sign out", and has an execution date within the current filter scope
    When the data pusher pushes report "run-104-d" with the ingest token and without an HTML bundle
    When the data pusher pushes the same report "run-104-d" again with the ingest token and without an HTML bundle
    When QA signs in to the local QA Dashboard and views Recent runs
    Then Recent runs should show only 1 run for report "run-104-d"

  Scenario: 05 Pushing the same report again does not add duplicate test results
    Given the data pusher holds a valid ingest token
    Given the local QA Dashboard has no run for report "run-104-e" yet
    Given report "run-104-e" is in the suites format of the Playwright JSON reporter, contains tests "user can sign in" and "user can sign out", and has an execution date within the current filter scope
    When the data pusher pushes report "run-104-e" with the ingest token and without an HTML bundle
    When the data pusher pushes the same report "run-104-e" again with the ingest token and without an HTML bundle
    When QA signs in to the local QA Dashboard and clicks View report for that run in Recent runs
    Then tests "user can sign in" and "user can sign out" should each appear only once in Test details

  Scenario: 06 Report files are saved when the push includes an HTML bundle
    Given the data pusher holds a valid ingest token
    Given the local QA Dashboard has no run for report "run-104-f" yet
    Given report "run-104-f" has an HTML bundle whose index.html has the report title "run-104-f", and has an execution date within the current filter scope
    When the data pusher pushes report "run-104-f" and its HTML bundle with the ingest token
    When QA signs in to the local QA Dashboard, clicks View report for that run in Recent runs, and clicks Open in a new tab
    Then the new tab should show the pushed HTML report with the report title "run-104-f"

  Scenario: 07 A push with only a browser session and no ingest token is not accepted
    Given QA is signed in to the local QA Dashboard and the browser holds a valid people session
    Given the local QA Dashboard has no run for report "run-104-g" yet
    Given report "run-104-g" is in the suites format of the Playwright JSON reporter and has an execution date within the current filter scope
    When the pusher pushes report "run-104-g" with only that browser session and without a bearer ingest token
    When QA refreshes the Dashboard and views Recent runs
    Then Recent runs should not show a run for report "run-104-g"
