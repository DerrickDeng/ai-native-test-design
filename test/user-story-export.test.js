const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');

const EXPORT_SCRIPT = path.resolve(__dirname, '../scripts/export-jira-user-story.mjs');
const VALIDATE_SCRIPT = path.resolve(__dirname, '../scripts/validate-jira-user-story.mjs');

const FEATURE_A = `@DEMO-9873
Feature: Order Information section

  Scenario: YFJ number field is displayed
    Given user has opened the Place order screen
    Then the YFJ Number field should be displayed

  Scenario Outline: account dropdown is filtered by client
    Given the client is "<client>"
    When user opens the Account dropdown
    Then the dropdown should list "<account>"
    Examples:
      | client | account |
      | Alice  | ACC-1   |
`;

const FEATURE_B = `@DEMO-9884
Feature: Execution section

  Scenario: reference price is displayed
    Given user has opened the Place order screen
    Then the Reference Price field should be displayed
`;

function makeRepo() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'user-story-'));
  fs.mkdirSync(path.join(root, 'testcases', 'RFQ'), { recursive: true });
  fs.writeFileSync(path.join(root, 'testcases', 'DEMO-9873.feature'), FEATURE_A);
  fs.writeFileSync(path.join(root, 'testcases', 'RFQ', 'DEMO-9884.feature'), FEATURE_B);
  return root;
}

function run(script, root, args = []) {
  const result = spawnSync(process.execPath, [script, root, ...args], { encoding: 'utf8' });
  return { status: result.status, stdout: result.stdout, stderr: result.stderr };
}

function listExports(root) {
  const dir = path.join(root, 'jira-user-story');
  if (!fs.existsSync(dir)) return [];
  const out = [];
  const walk = d => fs.readdirSync(d, { withFileTypes: true }).forEach(e => {
    const full = path.join(d, e.name);
    if (e.isDirectory()) return walk(full);
    out.push(path.relative(dir, full));
  });
  walk(dir);
  return out.sort();
}

test('exports one .txt per feature, mirroring the directory structure', () => {
  const root = makeRepo();
  const exported = run(EXPORT_SCRIPT, root);
  assert.strictEqual(exported.status, 0);
  assert.deepStrictEqual(listExports(root), ['DEMO-9873.txt', path.join('RFQ', 'DEMO-9884.txt')]);
  assert.strictEqual(run(VALIDATE_SCRIPT, root).status, 0);
});

test('the export follows the Jira User story field dialect', () => {
  const root = makeRepo();
  run(EXPORT_SCRIPT, root);
  const text = fs.readFileSync(path.join(root, 'jira-user-story', 'DEMO-9873.txt'), 'utf8');
  const lines = text.split('\n').filter(Boolean);

  assert.ok(!text.includes('Feature:'), 'the Feature line is dropped');
  assert.ok(!text.includes('Scenario Outline:'), 'Scenario Outline becomes Scenario');
  assert.ok(lines.every(l => !/^\s/.test(l)), 'every line starts at column zero');
  assert.strictEqual(text.split('@DEMO-9873').length - 1, 0, 'the story tag is skipped/dropped entirely in export');
  assert.ok(text.includes('Examples:'), 'Examples tables are kept');
  assert.ok(text.includes('| client | account |'), 'data-table rows are kept');
});

test('--only exports a single story and leaves the rest untouched', () => {
  const root = makeRepo();
  const exported = run(EXPORT_SCRIPT, root, ['--only', 'DEMO-9873']);
  assert.strictEqual(exported.status, 0);
  assert.match(exported.stdout, /Exported 1 Jira User story field file/);
  assert.deepStrictEqual(listExports(root), ['DEMO-9873.txt']);
});

test('--only validation passes without the whole-tree file list', () => {
  const root = makeRepo();
  run(EXPORT_SCRIPT, root, ['--only', 'DEMO-9873']);
  const validated = run(VALIDATE_SCRIPT, root, ['--only', 'DEMO-9873']);
  assert.strictEqual(validated.status, 0, validated.stdout + validated.stderr);
  assert.match(validated.stdout, /Validated 1 Jira User story file/);
});

test('--only matches a feature in a subdirectory', () => {
  const root = makeRepo();
  assert.strictEqual(run(EXPORT_SCRIPT, root, ['--only', 'DEMO-9884']).status, 0);
  assert.deepStrictEqual(listExports(root), [path.join('RFQ', 'DEMO-9884.txt')]);
});

test('--only fails loudly when nothing matches', () => {
  const root = makeRepo();
  const exported = run(EXPORT_SCRIPT, root, ['--only', 'DEMO-0000']);
  assert.strictEqual(exported.status, 1);
  assert.match(exported.stderr, /No feature file named DEMO-0000\.feature/);
});

test('validation catches an export that drifted from its feature file', () => {
  const root = makeRepo();
  run(EXPORT_SCRIPT, root);
  const txtPath = path.join(root, 'jira-user-story', 'DEMO-9873.txt');
  const tampered = fs.readFileSync(txtPath, 'utf8').replace('Then the YFJ Number field should be displayed', 'Then something else');
  fs.writeFileSync(txtPath, tampered);

  const validated = run(VALIDATE_SCRIPT, root);
  assert.strictEqual(validated.status, 1);
  assert.match(validated.stderr, /does not preserve steps/);
});
