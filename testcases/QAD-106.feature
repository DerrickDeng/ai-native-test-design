@QAD-106
Feature: People sign-in and report read access

  Scenario: 01 Opening the Dashboard while signed out shows Sign in
    Given the person is not signed in to the local QA Dashboard
    When the person opens the Dashboard
    Then the page should show "Sign in"

  Scenario: 02 After signing in with a valid local account, the Dashboard is shown on the Test execution tab
    Given a valid local account "qa-user" exists and the person is not signed in to the local QA Dashboard
    Given the person is on the Sign in page
    When the person signs in with the correct username and password of account "qa-user"
    Then the page should show the Dashboard
    Then the current tab should be "Test execution"

  Scenario Outline: 03 An ordinary sign-in failure always says the username or password is incorrect
    Given a valid local account "qa-user" exists whose password is not "wrong-password"
    Given a disabled local account "qa-disabled" exists
    Given the person is on the Sign in page
    When the person signs in with username "<username>" and password "<password>"
    Then the page should show "Username or password is incorrect."

    Examples:
      | username     | password                           |
      | no-such-user | any-password                       |
      | qa-user      | wrong-password                     |
      | qa-disabled  | the correct password of the account |

  Scenario: 04 Clicking Sign out returns to the sign-in page
    Given the person has signed in with a valid local account and sees the Dashboard
    When the person clicks "Sign out"
    Then the page should return to the sign-in page

  Scenario Outline: 05 Test information cannot be read without a valid session
    Given the local QA Dashboard has received run "run-106-a" and its HTML bundle as described in QAD-104
    Given the person has no valid people session
    When the person accesses "<target>"
    Then the access should be refused and no test information should be returned

    Examples:
      | target                                       |
      | a data request to the people Dashboard API   |
      | the details of run "run-106-a"               |
      | the /reports/... report address of run "run-106-a" |

  Scenario: 06 /health does not require sign-in
    Given the person has no valid people session
    When the person accesses "/health"
    Then the access should succeed without requiring sign-in

  Scenario Outline: 07 A password reset or account disable invalidates existing sessions
    Given a valid local account "qa-user" exists
    Given the person has signed in with account "qa-user" and sees the Dashboard
    When an administrator runs "<admin_action>" on account "qa-user" with the local admin command
    When the person triggers the next data request on the open Dashboard page
    Then the page should return to the sign-in page
    Then the page should show "Your session has ended. Sign in again to continue."

    Examples:
      | admin_action     |
      | reset password   |
      | disable account  |

  Scenario: 08 The sign-in page has no self-service registration or password reset entry
    Given the person is not signed in to the local QA Dashboard
    When the person opens the Sign in page
    Then the page should not offer a self-service registration entry
    Then the page should not offer a password reset entry
