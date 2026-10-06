const test = require('node:test');
const assert = require('node:assert');
const {
  parseFunctionalFeature,
  formatManualTestDescription
} = require('../src/domain/gherkin-testcases');

test('parses and formats a functional Scenario Outline without Jira dependencies', () => {
  const content = `@DEMO-101
Feature: Delivery selection

  Scenario Outline: 01 Show an available delivery method
    Given the basket is eligible for "<method>"
    When the customer opens delivery options
    Then "<method>" should be selectable
    Examples:
      | method  |
      | Express |
`;

  const { feature, scenarios } = parseFunctionalFeature(content);
  assert.deepStrictEqual(feature, { name: 'Delivery selection', tags: ['@DEMO-101'] });
  assert.strictEqual(scenarios.length, 1);
  assert.deepStrictEqual(scenarios[0].steps[2], {
    keyword: 'Then ',
    text: '"<method>" should be selectable'
  });

  const description = formatManualTestDescription(feature, scenarios[0]);
  assert.match(description, /Feature: Delivery selection/);
  assert.match(description, /- Then "<method>" should be selectable/);
  assert.match(description, /\| Express \|/);
});
