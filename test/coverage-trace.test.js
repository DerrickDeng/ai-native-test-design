const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const os = require('os');
const path = require('path');

const { lintFeature } = require('../src/utils/feature-lint');
const { lintIssue } = require('../src/utils/issue-lint');

const REQUIREMENT = `# DEMO-101 — Delivery fee

## Acceptance Criteria

### AC 1

Standard delivery is free for orders of 50 or more; otherwise the fee is 5. The fee is shown in the basket summary and in the order confirmation. Express delivery is not affected by this threshold and always costs 8.

### AC 2

The fee is rounded appropriately.

## Related Stories

DEMO-205
`;

const NOTE = `# Questions

- [ ] Q1 — How is the fee rounded?
`;

const FEATURE = `@DEMO-101
Feature: Delivery fee

  Scenario: 01 Standard delivery is free at the threshold
    Given customer has standard delivery selected
    Given the basket total is 50
    When customer opens the basket summary
    Then the delivery fee should be "0"

  Scenario: 02 Standard delivery costs 5 below the threshold
    Given customer has standard delivery selected
    Given the basket total is 49
    When customer opens the basket summary
    Then the delivery fee should be "5"

  Scenario: 03 Order confirmation shows the fee
    Given customer has standard delivery selected
    Given the basket total is 49
    When customer places the order
    Then the order confirmation should show the delivery fee "5"

  Scenario Outline: 04 Express delivery keeps its fee
    Given customer has express delivery selected
    Given the basket total is <total>
    When customer opens the basket summary
    Then the delivery fee should be "8"

    Examples:
      | total |
      | 49    |
      | 50    |
`;

const COVERAGE = `# DEMO-101 Coverage Trace

## Related Stories

| Story | Relation | Handling |
|---|---|---|
| DEMO-205 | No impact | Read its AC. It covers tax display only. |

## Atoms

| Atom | Source | Quote | Disposition | Ref |
|---|---|---|---|---|
| A01 | AC 1 | Standard delivery is free for orders of 50 or more | Covered | |
| A02 | AC 1 | otherwise the fee is 5 | Covered | |
| A03 | AC 1 | The fee is shown in the basket summary | Covered | |
| A04 | AC 1 | and in the order confirmation | Covered | |
| A05 | AC 1 | Express delivery is not affected by this threshold | Covered | |
| A06 | AC 1 | always costs 8 | Covered | |
| A07 | AC 2 | The fee is rounded appropriately | Question | Q1 |

## Assertions

| Then | Atom | Type | Basis |
|---|---|---|---|
| 01.1 | A01 | Stated | |
| 01.1 | A03 | Stated | |
| 02.1 | A02 | Derived | Total 49 is below 50, so the fee is 5. |
| 02.1 | A03 | Stated | |
| 03.1 | A04 | Stated | |
| 04.1 | A05 | Stated | |
| 04.1 | A06 | Stated | |
`;

function workspace({ coverage = COVERAGE, feature = FEATURE, requirement = REQUIREMENT, note = NOTE } = {}) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'coverage-trace-'));
  const dir = path.join(root, 'requirements', 'DEMO-101');
  fs.mkdirSync(dir, { recursive: true });
  fs.mkdirSync(path.join(root, 'testcases'));
  fs.writeFileSync(path.join(dir, 'DEMO-101-2026-01-01-formatted.md'), requirement);
  if (note !== null) fs.writeFileSync(path.join(dir, 'note.md'), note);
  if (coverage !== null) fs.writeFileSync(path.join(dir, 'coverage.md'), coverage);
  const featurePath = path.join(root, 'testcases', 'DEMO-101.feature');
  fs.writeFileSync(featurePath, feature);
  return { root, featurePath, feature };
}

function lint(options) {
  const { root, featurePath, feature } = workspace(options);
  return lintIssue({ issueId: 'DEMO-101', featurePath, content: feature, repoRoot: root });
}

const rules = findings => findings.map(f => f.rule);

test('the worked example in the skill reference lints clean', () => {
  const result = lint();
  assert.deepEqual(result.errors, []);
  assert.deepEqual(rules(result.warnings), []);
});

test('a missing coverage trace is a warning, not an error', () => {
  const result = lint({ coverage: null });
  assert.deepEqual(result.errors, []);
  assert.deepEqual(rules(result.warnings), ['trace-missing']);
});

test('a quote that is not in the source is an error', () => {
  const result = lint({ coverage: COVERAGE.replace('otherwise the fee is 5', 'otherwise the fee is 6') });
  assert.deepEqual(rules(result.errors), ['atom-quote-not-found']);
});

test('a quote may cite a confirmed note', () => {
  const coverage = COVERAGE.replace(
    '| A07 | AC 2 | The fee is rounded appropriately | Question | Q1 |',
    '| A07 | note | How is the fee rounded? | Covered | |'
  ).replace('| 04.1 | A06 | Stated | |', '| 04.1 | A06 | Stated | |\n| 04.1 | A07 | Stated | |');
  assert.deepEqual(rules(lint({ coverage }).errors), []);
});

test('a Covered atom with no assertion is an error', () => {
  const coverage = COVERAGE.replace('| 03.1 | A04 | Stated | |\n', '');
  assert.deepEqual(rules(lint({ coverage }).errors).sort(), ['atom-uncovered', 'then-untraced']);
});

test('a Then with no trace row is an error', () => {
  const feature = FEATURE.replace(
    '    Then the delivery fee should be "0"\n',
    '    Then the delivery fee should be "0"\n    Then the basket total should be "50"\n'
  );
  assert.deepEqual(rules(lint({ feature }).errors), ['then-untraced']);
});

test('a trace row that points at no Then is an error', () => {
  const coverage = COVERAGE.replace('| 04.1 | A06 | Stated | |', '| 04.1 | A06 | Stated | |\n| 09.1 | A06 | Stated | |');
  assert.deepEqual(rules(lint({ coverage }).errors), ['then-orphan']);
});

test('an Inferred assertion is an error', () => {
  const coverage = COVERAGE.replace('| 03.1 | A04 | Stated | |', '| 03.1 | A04 | Inferred | |');
  assert.deepEqual(rules(lint({ coverage }).errors), ['assertion-type']);
});

test('a Derived assertion needs a basis', () => {
  const coverage = COVERAGE.replace('| Derived | Total 49 is below 50, so the fee is 5. |', '| Derived | |');
  assert.deepEqual(rules(lint({ coverage }).errors), ['derived-basis-missing']);
});

test('asserting an atom that is blocked by a question is an error', () => {
  const coverage = COVERAGE.replace('| 04.1 | A06 | Stated | |', '| 04.1 | A06 | Stated | |\n| 04.1 | A07 | Stated | |');
  assert.deepEqual(rules(lint({ coverage }).errors), ['assertion-blocked-atom']);
});

test('a Question atom must point to a real note question', () => {
  const missingRef = COVERAGE.replace('| Question | Q1 |', '| Question | |');
  assert.deepEqual(rules(lint({ coverage: missingRef }).errors), ['atom-question-ref']);

  const unknownRef = COVERAGE.replace('| Question | Q1 |', '| Question | Q9 |');
  assert.deepEqual(rules(lint({ coverage: unknownRef }).errors), ['atom-question-unknown']);
});

test('an Owned elsewhere atom needs another Story as owner', () => {
  const own = COVERAGE.replace('| A07 | AC 2 | The fee is rounded appropriately | Question | Q1 |', '| A07 | AC 2 | The fee is rounded appropriately | Owned elsewhere | DEMO-101 |');
  assert.deepEqual(rules(lint({ coverage: own }).errors), ['atom-owner-missing']);

  const other = COVERAGE.replace('| Question | Q1 |', '| Owned elsewhere | DEMO-205 |');
  const result = lint({ coverage: other });
  assert.deepEqual(result.errors, []);
});

test('a Not testable atom needs a reason', () => {
  const coverage = COVERAGE.replace('| Question | Q1 |', '| Not testable | |');
  assert.deepEqual(rules(lint({ coverage }).errors), ['atom-reason-missing']);
});

test('a related Story from the requirement must have a row', () => {
  const coverage = COVERAGE.replace('| DEMO-205 | No impact | Read its AC. It covers tax display only. |\n', '');
  const result = lint({ coverage });
  assert.ok(rules(result.errors).includes('related-story-unaccounted'));
});

test('a related Story row needs a valid relation and handling', () => {
  const coverage = COVERAGE.replace('| DEMO-205 | No impact | Read its AC. It covers tax display only. |', '| DEMO-205 | Nearby | |');
  assert.deepEqual(rules(lint({ coverage }).errors).sort(), ['related-story-handling', 'related-story-relation']);
});

test('a duplicate atom id is an error', () => {
  const coverage = COVERAGE.replace('| A02 | AC 1 |', '| A01 | AC 1 |');
  assert.ok(rules(lint({ coverage }).errors).includes('atom-duplicate-id'));
});

test('missing tables are reported as a structure error', () => {
  const result = lint({ coverage: '# DEMO-101 Coverage Trace\n' });
  assert.ok(rules(result.errors).includes('trace-structure'));
});

test('two scenarios with identical steps are an error', () => {
  const feature = `@DEMO-101
Feature: Delivery fee

  Scenario: 01 Fee for a large basket
    Given the basket total is 50
    When customer opens the basket summary
    Then the delivery fee should be "0"

  Scenario: 02 Fee at the threshold
    Given the basket total is 50
    When customer opens the basket summary
    Then the delivery fee should be "0"
`;
  assert.ok(rules(lintFeature(feature).errors).includes('duplicate-scenario-body'));
});

test('scenarios that differ only in Given get a warning', () => {
  const feature = `@DEMO-101
Feature: Delivery fee

  Scenario: 01 No orders yet
    Given no orders exist
    When customer opens the report
    Then the rate should show "—"

  Scenario: 02 Orders exist but none count
    Given only skipped orders exist
    When customer opens the report
    Then the rate should show "—"
`;
  const result = lintFeature(feature);
  assert.deepEqual(result.errors, []);
  assert.deepEqual(rules(result.warnings), ['same-action-and-outcome']);
});

test('a scenario that matches another Story by action and outcome gets a warning', () => {
  const { root, featurePath, feature } = workspace();
  fs.writeFileSync(path.join(root, 'testcases', 'DEMO-205.feature'), `@DEMO-205
Feature: Tax display

  Scenario: 01 Fee is visible
    Given customer has an order
    When customer opens the basket summary
    Then the delivery fee should be "0"
`);
  const result = lintIssue({ issueId: 'DEMO-101', featurePath, content: feature, repoRoot: root });
  const overlap = result.warnings.filter(w => w.rule === 'cross-story-overlap');
  assert.equal(overlap.length, 1);
  assert.match(overlap[0].message, /DEMO-205\.feature/);
  assert.deepEqual(result.errors, []);
});

test('coverage.md text that names a removed scenario is an error', () => {
  const coverage = COVERAGE.replace('# DEMO-101 Coverage Trace\n', '# DEMO-101 Coverage Trace\n\nThe threshold is also covered by scenario 07.\n');
  const result = lint({ coverage });
  assert.deepEqual(rules(result.errors), ['scenario-ref-missing']);
});

test('a scenario number that exists in the feature is accepted in coverage.md', () => {
  const coverage = COVERAGE.replace('# DEMO-101 Coverage Trace\n', '# DEMO-101 Coverage Trace\n\nSee scenarios 01 and 02 for the threshold.\n');
  assert.deepEqual(lint({ coverage }).errors, []);
});

test('note.md that names a removed scenario is a warning, and another Story\'s scenario is skipped', () => {
  const stale = lint({ note: NOTE + '\nThe 31 day case is covered by scenario 09.\n' });
  assert.deepEqual(rules(stale.warnings), ['scenario-ref-missing']);
  assert.equal(stale.warnings[0].file, 'note.md');

  const other = lint({ note: NOTE + '\nDEMO-205 scenario 09 owns that rule.\n' });
  assert.deepEqual(other.warnings, []);
});

test('scenarios whose steps match but whose data tables differ are not duplicates', () => {
  const feature = `@DEMO-101
Feature: Ranking

  Scenario: 01 All skipped
    Given these runs exist
      | run | status  |
      | 1   | skipped |
      | 2   | skipped |
    When customer views the ranking
    Then the ranking should be empty

  Scenario: 02 Passed with a skipped run between
    Given these runs exist
      | run | status  |
      | 1   | passed  |
      | 2   | skipped |
    When customer views the ranking
    Then the ranking should be empty
`;
  const result = lintFeature(feature);
  assert.deepEqual(result.errors, []);
  assert.deepEqual(rules(result.warnings), ['same-action-and-outcome']);
});

test('scenarios with the same steps and the same data tables are still duplicates', () => {
  const scenario = name => `  Scenario: ${name}
    Given these runs exist
      | run | status  |
      | 1   | skipped |
    When customer views the ranking
    Then the ranking should be empty
`;
  const feature = `@DEMO-101\nFeature: Ranking\n\n${scenario('01 First')}\n${scenario('02 Second')}`;
  assert.ok(rules(lintFeature(feature).errors).includes('duplicate-scenario-body'));
});

test('a Then that explains the arithmetic or a contrast gets a warning', () => {
  const feature = `@DEMO-101
Feature: Rate

  Scenario: 01 Rate shown
    Given a run with 3 passed and 1 failed
    When customer views the rate
    Then the rate should be 75%, i.e. 3 out of 4

  Scenario: 02 Rate shown in Chinese
    Given a run with 3 passed and 1 failed
    When customer views the summary
    Then 通过率应显示 75%，即 3/4
    Then 通过率应显示 75%，而不是两个 run 的平均值
`;
  const result = lintFeature(feature);
  assert.deepEqual(result.errors, []);
  assert.deepEqual(rules(result.warnings), ['then-rationale', 'then-rationale', 'then-rationale']);
});

test('a plain Then and a stated negation do not get a rationale warning', () => {
  const feature = `@DEMO-101
Feature: Rate

  Scenario: 01 Rate shown
    Given a run with 3 passed and 1 failed
    When customer views the rate
    Then the rate should be 75%

  Scenario: 02 No fake zero
    Given a run with no comparison
    When customer views the rate
    Then 通过率应显示 "—"，不应显示 "0%"
`;
  assert.deepEqual(lintFeature(feature).warnings, []);
});
