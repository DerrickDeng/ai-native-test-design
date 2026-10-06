@QAD-105
Feature: Review a report from the run list

  Scenario: 01 Clicking View report for the selected run opens that run's details
    Given the data pusher has pushed two runs without an HTML bundle as described in QAD-104, both with execution dates within the current filter scope
    Given run "run-105-x" has 7 tests, including "order can be created", of which 3 passed, 1 failed, 1 flaky, and 2 skipped
    Given run "run-105-y" has 4 tests, including "payment can be completed", of which 4 passed
    Given QA is signed in to the local QA Dashboard and views Recent runs
    When QA clicks View report for run "run-105-x" in Recent runs
    Then the details page should show the status counts of run "run-105-x": passed 3, failed 1, flaky 1, skipped 2
    Then the details page should open the details of run "run-105-x", and Test details should list test "order can be created"
    Then the details page should not show test "payment can be completed" of run "run-105-y"

  Scenario: 02 A run with a bundle embeds the saved original HTML report and offers Open in a new tab
    Given the data pusher has pushed run "run-105-b" and its HTML bundle as described in QAD-104, where index.html has the report title "run-105-b", with an execution date within the current filter scope
    Given QA is signed in to the local QA Dashboard and views Recent runs
    When QA clicks View report for run "run-105-b" in Recent runs
    Then the details page should embed the saved original HTML report with the report title "run-105-b"
    Then the details page should offer "Open in a new tab"

  Scenario: 03 A run with a bundle keeps the uploaded report assets
    Given the data pusher has pushed run "run-105-r" and its HTML bundle as described in QAD-104, where the bundle includes an uploaded screenshot of the failed test "user can sign out", with an execution date within the current filter scope
    Given QA is signed in to the local QA Dashboard and views Recent runs
    When QA clicks View report for run "run-105-r" in Recent runs
    When QA opens the screenshot of test "user can sign out" in the embedded report
    Then the uploaded screenshot should be shown

  Scenario: 04 A run without a bundle shows Test details and states that no HTML bundle was uploaded
    Given the data pusher has pushed run "run-105-n" without an HTML bundle as described in QAD-104, containing tests "user can sign in" and "user can sign out", with an execution date within the current filter scope
    Given QA is signed in to the local QA Dashboard and views Recent runs
    When QA clicks View report for run "run-105-n" in Recent runs
    Then the details page should show "Test details"
    Then Test details should contain the six columns "Test", "Project", "Result", "Duration", "Retries", and "Error"
    Then the details page should clearly state that this run did not upload an HTML bundle

  Scenario: 05 Test details is grouped by feature
    Given the data pusher has pushed run "run-105-g" without an HTML bundle as described in QAD-104, with an execution date within the current filter scope
    Given in run "run-105-g", tests "user can sign in" and "user can sign out" belong to one feature, and test "order can be created" belongs to another feature
    Given QA is signed in to the local QA Dashboard and views Recent runs
    When QA clicks View report for run "run-105-g" in Recent runs
    Then in Test details, "user can sign in" and "user can sign out" should be in the same group, and "order can be created" should be in another group

  Scenario: 06 A row with no error message shows —
    Given the data pusher has pushed run "run-105-e" without an HTML bundle as described in QAD-104, where test "user can sign in" has no error message, with an execution date within the current filter scope
    Given QA is signed in to the local QA Dashboard and views Recent runs
    When QA clicks View report for run "run-105-e" in Recent runs
    Then the Error of test "user can sign in" should show "—"

  Scenario: 07 A run without a bundle shows no entry point for traces, screenshots, or videos
    Given the data pusher has pushed run "run-105-f" without an HTML bundle as described in QAD-104, where test "user can sign out" failed with an error message, with an execution date within the current filter scope
    Given QA is signed in to the local QA Dashboard and views Recent runs
    When QA clicks View report for run "run-105-f" in Recent runs
    Then the details page should show no entry point for any trace, screenshot, or video
