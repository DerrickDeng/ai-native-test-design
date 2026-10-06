/**
 * Lint one Story: the feature file itself, its coverage trace, and overlap with
 * the features of other Stories.
 */

const fs = require('fs');
const path = require('path');
const { lintFeature, scenarioSignatures } = require('./feature-lint');
const { COVERAGE_FILE, lintCoverageTrace } = require('./coverage-trace');

function listFeatureFiles(dir) {
  let entries;
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  } catch {
    return [];
  }
  return entries.flatMap(entry => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return listFeatureFiles(full);
    return entry.isFile() && entry.name.endsWith('.feature') ? [full] : [];
  });
}

/**
 * Warn about scenarios whose `When` and `Then` steps match a scenario in another
 * Story's feature. The other Story may own the rule.
 */
function findCrossStoryOverlaps({ featurePath, scenarios, testcasesDir }) {
  const warnings = [];
  const own = path.resolve(featurePath);
  const others = listFeatureFiles(testcasesDir).filter(file => path.resolve(file) !== own);
  if (others.length === 0 || scenarios.length === 0) return warnings;

  const known = new Map();
  others.forEach(file => {
    let content;
    try {
      content = fs.readFileSync(file, 'utf8');
    } catch {
      return;
    }
    const { scenarios: otherScenarios } = lintFeature(content);
    otherScenarios.forEach(scenario => {
      const { action } = scenarioSignatures(scenario);
      if (action && !known.has(action)) known.set(action, { file: path.basename(file), name: scenario.name });
    });
  });

  scenarios.forEach(scenario => {
    const { action } = scenarioSignatures(scenario);
    const match = action && known.get(action);
    if (match) {
      warnings.push({
        line: scenario.line,
        rule: 'cross-story-overlap',
        message: `Scenario "${scenario.name}" has the same \`When\` and \`Then\` steps as "${match.name}" in ${match.file}. Check which Story owns the rule. If it is the other Story, mark the atom Owned elsewhere and remove this scenario.`
      });
    }
  });
  return warnings;
}

/**
 * @param {object} options
 * @param {string} options.issueId
 * @param {string} options.featurePath - Absolute path of the feature file
 * @param {string} options.content - Feature file text
 * @param {string} options.repoRoot
 * @returns {object} lintFeature() result with trace and overlap findings merged in
 */
function lintIssue({ issueId, featurePath, content, repoRoot }) {
  const result = lintFeature(content);
  const requirementsDir = path.join(repoRoot, 'requirements');
  const testcasesDir = path.join(repoRoot, 'testcases');

  const coveragePath = path.join(requirementsDir, issueId, COVERAGE_FILE);
  let coverageContent = null;
  try {
    coverageContent = fs.readFileSync(coveragePath, 'utf8');
  } catch {
    coverageContent = null;
  }

  if (coverageContent === null) {
    result.warnings.push({
      file: COVERAGE_FILE,
      line: 0,
      rule: 'trace-missing',
      message: `requirements/${issueId}/${COVERAGE_FILE} not found. Write the coverage trace so completeness can be checked. See skills/functional-test-design/references/coverage-trace.md.`
    });
  } else {
    const trace = lintCoverageTrace({
      issueId,
      coverageContent,
      scenarios: result.scenarios,
      requirementsDir
    });
    result.errors.push(...trace.errors);
    result.warnings.push(...trace.warnings);
  }

  result.warnings.push(...findCrossStoryOverlaps({ featurePath, scenarios: result.scenarios, testcasesDir }));
  return result;
}

module.exports = { lintIssue, findCrossStoryOverlaps };
