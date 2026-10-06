const test = require('node:test');
const assert = require('node:assert');
const { lintFeature } = require('../src/utils/feature-lint');

const CLEAN_FEATURE = `@DEMO-1234
Feature: Order Details page

  Scenario: 01 Execution Condition dropdown displays the allowed options
    Given RM user is logged in on One OMS
    Given user has opened the Place order screen
    When user clicks on the Execution Condition dropdown
    Then the dropdown should display the option "Market"

  Scenario: 02 Notional below the product minimum is rejected
    Given a product with a minimum notional of "10000"
    When the order is submitted with notional "5000"
    Then the service should reject the order with error "BELOW_MIN_NOTIONAL"

  Scenario: 03 Account dropdown is filtered by the selected client
    Given the account service returns two eligible accounts for the client
    When user opens the Account dropdown
    Then the dropdown should list exactly the two eligible accounts
`;

test('a strategy-conforming feature file produces no findings', () => {
  const result = lintFeature(CLEAN_FEATURE);
  assert.deepStrictEqual(result.errors, [], JSON.stringify(result.errors, null, 2));
  assert.deepStrictEqual(result.warnings, [], JSON.stringify(result.warnings, null, 2));
  assert.strictEqual(result.scenarios.length, 3);
});

test('And / But keywords are errors', () => {
  const feature = CLEAN_FEATURE.replace('    Then the dropdown should list exactly the two eligible accounts', '    And the dropdown should list exactly the two eligible accounts');
  const result = lintFeature(feature);
  assert.ok(result.errors.some(e => e.rule === 'no-and-but'));
});

test('scenario names require sequential zero-padded number prefixes', () => {
  const missing = lintFeature(CLEAN_FEATURE.replace('Scenario: 01 Execution', 'Scenario: Execution'));
  assert.ok(missing.errors.some(e => e.rule === 'scenario-number-prefix'));

  const skipped = lintFeature(CLEAN_FEATURE.replace('Scenario: 02 Notional', 'Scenario: 04 Notional'));
  assert.ok(skipped.errors.some(e => e.rule === 'scenario-number-sequence' && /must be `02`/.test(e.message)));
});

test('scenario duplicate detection ignores the number prefix', () => {
  const feature = CLEAN_FEATURE.replace(
    '03 Account dropdown is filtered by the selected client',
    '03 Execution Condition dropdown displays the allowed options'
  );
  const result = lintFeature(feature);
  assert.ok(result.errors.some(e => e.rule === 'duplicate-scenario-name'));
});

test('any scenario-level tag is an error', () => {
  const feature = CLEAN_FEATURE.replace('  Scenario: 03 Account dropdown', '  @DEMO-1234\n  Scenario: 03 Account dropdown');
  const result = lintFeature(feature);
  assert.ok(result.errors.some(e => e.rule === 'scenario-tag'));
});

test('the Feature requires exactly one issue-key tag and no extra tags', () => {
  const missing = lintFeature(CLEAN_FEATURE.replace('@DEMO-1234\n', ''));
  assert.ok(missing.errors.some(e => e.rule === 'feature-issue-key'));

  const extra = lintFeature(CLEAN_FEATURE.replace('@DEMO-1234', '@DEMO-1234 @e2e'));
  assert.ok(extra.errors.some(e => e.rule === 'feature-tag'));
});

test('Background is an error', () => {
  const feature = CLEAN_FEATURE.replace('  Scenario:', '  Background:\n    Given RM user is logged in on One OMS\n\n  Scenario:');
  const result = lintFeature(feature);
  assert.ok(result.errors.some(e => e.rule === 'no-background'));
});

test('a scenario without Then is an error', () => {
  const feature = `@DEMO-1
Feature: F

  Scenario: 01 no assertion
    Given user is on the page
    When user clicks the button
`;
  const result = lintFeature(feature);
  assert.ok(result.errors.some(e => e.rule === 'missing-then'));
});

test('unused and undefined Examples columns are warnings', () => {
  const feature = `@DEMO-1
Feature: F

  Scenario Outline: 01 status badge colour
    Given the order status is "<order_status>"
    Then the badge should use the colour "<badge_colour>"
    Examples:
      | order_status | badge_color |
      | Pending      | amber       |
`;
  const result = lintFeature(feature);
  assert.ok(result.warnings.some(w => w.rule === 'unused-example-column'));
  assert.ok(result.warnings.some(w => w.rule === 'undefined-placeholder'));
});

// --- inline TBC: recorded and blocking --------------------------------------

const TBC_FEATURE = `@DEMO-1234
Feature: Order Details page

  # TBC: AC does not say whether the account list is filtered client-side or by the account service.
  Scenario: 01 Account dropdown lists only the eligible accounts
    Given the client "Alice" is selected
    When user opens the Account dropdown
    Then the dropdown should list only the eligible accounts
`;

test('TBC comments are recorded and reported', () => {
  const result = lintFeature(TBC_FEATURE);
  assert.strictEqual(result.tbc.length, 1);
  assert.strictEqual(result.tbc[0].scenario, '01 Account dropdown lists only the eligible accounts');
  assert.match(result.tbc[0].questions[0], /filtered client-side or by the account service/);
});

test('TBC comments are errors until moved to note.md', () => {
  const result = lintFeature(TBC_FEATURE);
  assert.ok(result.errors.some(e => e.rule === 'no-inline-tbc'));
});

test('a clean feature reports no open questions', () => {
  const result = lintFeature(CLEAN_FEATURE);
  assert.deepStrictEqual(result.tbc, []);
});

test('the TBC block explains that inline questions must move', () => {
  const { formatLintReport } = require('../src/utils/feature-lint');
  const report = formatLintReport(lintFeature(TBC_FEATURE), 'testcases/DEMO-1234.feature');
  assert.match(report, /\[TBC\] 1 inline open question/);
  assert.match(report, /no-inline-tbc/);
});

test('a wrapped # TBC question keeps its continuation lines', () => {
  const feature = CLEAN_FEATURE.replace(
    '  Scenario: 03 Account dropdown',
    [
      '  # TBC - DEMO-1234 says all accounts are listed, but the screenshot shows',
      '  # only eligible ones. Please confirm:',
      '  # - is an ineligible account hidden, or shown disabled?',
      '  Scenario: 03 Account dropdown',
      ''
    ].join('\n')
  );
  const result = lintFeature(feature);
  assert.strictEqual(result.tbc.length, 1);
  assert.strictEqual(result.tbc[0].questions.length, 3);
  assert.match(result.tbc[0].questions[2], /hidden, or shown disabled/);
});

test('a blank line closes a TBC block so the next comment is not swallowed', () => {
  const feature = CLEAN_FEATURE.replace(
    '  Scenario: 01 Execution Condition',
    '  # TBC - first question.\n\n  # an ordinary comment, not part of the question\n\n  Scenario: 01 Execution Condition'
  );
  const result = lintFeature(feature);
  assert.strictEqual(result.tbc.length, 1);
  assert.deepStrictEqual(result.tbc[0].questions, ['first question.']);
});
