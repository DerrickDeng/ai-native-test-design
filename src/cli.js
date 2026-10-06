const fs = require('fs');
const path = require('path');
const JiraService = require('./services/jira-service');
const { spawnSync } = require('child_process');
const { formatLintReport } = require('./utils/feature-lint');
const { lintIssue } = require('./utils/issue-lint');

const REPO_ROOT = path.resolve(__dirname, '..');

function showUsage() {
  console.log(`
AI-Native Test Design CLI

Usage:
  node bin/jira-sync fetch <issueId>
  node bin/jira-sync lint <issueId> [featureFilePath]
  node bin/jira-sync export <issueId> [featureFilePath] [--force]
  node bin/jira-sync upload-user-story <issueId>
  node bin/jira-sync create-zephyr-tests <issueId> [featureFilePath] [--force] [--prefix "<prefix>"] [--level "<level1,level2>"] [--assignee "<username>"] [--scenario "<pattern>"]
  node bin/jira-sync export-user-story

Options:
  --force            Bypass the feature strategy gate for export or Zephyr sync.
  --prefix <string>  create-zephyr-tests: Custom prefix for summaries (default: "[Auto-Generated]").
  --level <string>   create-zephyr-tests: Comma-separated test levels (default: "UAT"). Supported: SIT, UAT, REGRESSION, PAT, PERFORMANCE, GSAP.
  --assignee <string> create-zephyr-tests: JIRA assignee username. Special value "current" or "me" uses current logged-in user. Default (empty) leaves it unassigned.
  --scenario <string> create-zephyr-tests: Filter scenarios in the feature file by a case-insensitive substring.

Examples:
  node bin/jira-sync fetch DEMO-101
  node bin/jira-sync lint DEMO-101
  node bin/jira-sync export DEMO-101
  node bin/jira-sync upload-user-story DEMO-101
  node bin/jira-sync create-zephyr-tests DEMO-101 --prefix "[UAT]" --level "SIT,UAT" --assignee me
  node bin/jira-sync export-user-story
`);
}

function findFileRecursively(baseDir, targetFileName) {
  if (!fs.existsSync(baseDir)) return null;
  const entries = fs.readdirSync(baseDir, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.isDirectory()) {
      const found = findFileRecursively(path.join(baseDir, entry.name), targetFileName);
      if (found) {
        return found;
      }
    } else if (entry.isFile()) {
      if (entry.name.toLowerCase() === targetFileName.toLowerCase()) {
        return path.join(baseDir, entry.name);
      }
    }
  }
  return null;
}

/**
 * Resolve the .feature file for an issue, either from an explicit path or the
 * conventional testcases/ locations.
 * @returns {string|null} Absolute path, or null when nothing was found
 */
function resolveFeaturePath(issueId, explicitPath) {
  if (explicitPath) {
    const resolved = path.resolve(process.cwd(), explicitPath);
    if (!fs.existsSync(resolved)) {
      console.error(`Error: File does not exist at path: ${resolved}`);
      return null;
    }
    return resolved;
  }

  const baseTestcasesDirs = [
    path.resolve(__dirname, '../testcases'),
    path.resolve(__dirname, '../../testcases'),
    path.resolve(process.cwd(), 'testcases')
  ];

  const targetFileName = `${issueId}.feature`;
  for (const baseDir of baseTestcasesDirs) {
    const found = findFileRecursively(baseDir, targetFileName);
    if (found) {
      return found;
    }
  }

  const possiblePaths = baseTestcasesDirs.map(baseDir => path.join(baseDir, targetFileName));
  console.error(`Error: Could not find generated .feature file for issue ${issueId} automatically.`);
  console.error(`Attempted locations (and their subdirectories):`);
  possiblePaths.forEach(p => console.error(`  - ${p}`));
  console.error(`Please provide the file path explicitly:`);
  console.error(`  node bin/jira-sync <command> ${issueId} /path/to/feature/file.feature`);
  return null;
}


/**
 * Run a repository-level script under scripts/ as a child process, streaming its
 * output. Returns the script's exit code.
 * @param {string} label - Human-readable step name for spawn errors
 * @param {string} scriptName - File name under scripts/
 * @param {string[]} scriptArgs - Arguments passed through to the script
 */
function runScript(label, scriptName, scriptArgs = []) {
  const scriptPath = path.resolve(__dirname, '..', 'scripts', scriptName);
  const result = spawnSync(process.execPath, [scriptPath, ...scriptArgs], { stdio: 'inherit' });

  if (result.error) {
    console.error(`Error running the ${label} script: ${result.error.message}`);
    return 1;
  }
  return result.status || 0;
}

/**
 * Export every testcases/*.feature into the Jira "User story" field dialect
 * under jira-user-story/, then validate the exports round-trip.
 */
function runUserStoryExport() {
  const exportCode = runScript('export', 'export-jira-user-story.mjs');
  if (exportCode !== 0) return exportCode;
  return runScript('validate', 'validate-jira-user-story.mjs');
}

async function run(args) {
  if (args.includes('--help') || args.includes('-h')) {
    showUsage();
    return 0;
  }

  const prefixIndex = args.indexOf('--prefix');
  let prefix = '[Auto-Generated]';
  if (prefixIndex >= 0 && args[prefixIndex + 1]) {
    prefix = args[prefixIndex + 1];
  }

  const levelIndex = args.indexOf('--level');
  let testLevels = ['UAT'];
  if (levelIndex >= 0 && args[levelIndex + 1]) {
    testLevels = args[levelIndex + 1].split(',').map(l => l.trim());
  }

  const assigneeIndex = args.indexOf('--assignee');
  let assignee = null;
  if (assigneeIndex >= 0 && args[assigneeIndex + 1]) {
    assignee = args[assigneeIndex + 1];
  }

  const scenarioIndex = args.indexOf('--scenario');
  let scenarioFilter = null;
  if (scenarioIndex >= 0 && args[scenarioIndex + 1]) {
    scenarioFilter = args[scenarioIndex + 1];
  }

  const flags = args.filter((a, idx) => 
    a.startsWith('--') && 
    a !== '--prefix' && args[idx - 1] !== '--prefix' &&
    a !== '--level' && args[idx - 1] !== '--level' &&
    a !== '--assignee' && args[idx - 1] !== '--assignee' &&
    a !== '--scenario' && args[idx - 1] !== '--scenario'
  ).map(a => a.toLowerCase());

  const positional = args.filter((a, idx) => 
    !a.startsWith('--') && 
    args[idx - 1] !== '--prefix' &&
    args[idx - 1] !== '--level' &&
    args[idx - 1] !== '--assignee' &&
    args[idx - 1] !== '--scenario'
  );

  if (positional.length < 1) {
    showUsage();
    return 1;
  }

  const command = positional[0].toLowerCase();

  // Commands that operate on the whole repository, not a single issue.
  const REPO_LEVEL_COMMANDS = ['export-user-story', 'user-story'];
  if (!REPO_LEVEL_COMMANDS.includes(command) && positional.length < 2) {
    showUsage();
    return 1;
  }

  const issueId = (positional[1] || '').toUpperCase();
  const force = flags.includes('--force');

  try {
    // Repository-level commands are purely local — no Jira credentials needed.
    if (command === 'export-user-story' || command === 'user-story') {
      return runUserStoryExport();
    }

    // `lint` is a purely local check — it must work without Jira credentials.
    if (command === 'lint' || command === 'check') {
      const featurePath = resolveFeaturePath(issueId, positional[2]);
      if (!featurePath) return 1;

      const gherkinContent = fs.readFileSync(featurePath, 'utf8');
      const lintResult = lintIssue({ issueId, featurePath, content: gherkinContent, repoRoot: REPO_ROOT });
      console.log(formatLintReport(lintResult, featurePath));

      if (lintResult.errors.length > 0) {
        console.error(`\nStrategy lint failed with ${lintResult.errors.length} error(s). Fix them before exporting.`);
        return 1;
      }
      return 0;
    }

    const jiraService = new JiraService();

    if (command === 'fetch') {
      await jiraService.fetchIssue(issueId);
      return 0;
    } else if (command === 'export' || command === 'save') {
      const featurePath = resolveFeaturePath(issueId, positional[2]);
      if (!featurePath) return 1;

      console.log(`Reading test case file from: ${featurePath}`);
      const gherkinContent = fs.readFileSync(featurePath, 'utf8');

      // Strategy gate: a non-conforming feature file must never reach Jira
      const lintResult = lintIssue({ issueId, featurePath, content: gherkinContent, repoRoot: REPO_ROOT });
      console.log(formatLintReport(lintResult, featurePath));

      if (lintResult.errors.length > 0 && !force) {
        console.error(`\nExport aborted: ${lintResult.errors.length} strategy error(s) in the feature file.`);
        console.error(`Fix them, or re-run with --force if you intentionally want to export as-is.`);
        return 1;
      }
      if (lintResult.errors.length > 0 && force) {
        console.warn(`\n[--force] Exporting despite ${lintResult.errors.length} strategy error(s).`);
      }
      // Regenerate this story's Jira "User story" field text. Scenarios never go
      // into the Jira description directly — that would trigger Jira's internal
      // webhook and spawn a spammy individual test case per scenario.
      const testcasesDir = path.resolve(__dirname, '../testcases');
      if (featurePath.startsWith(testcasesDir + path.sep)) {
        const exportCode = runScript('export', 'export-jira-user-story.mjs', ['--only', issueId]);
        if (exportCode !== 0) return exportCode;

        const validateCode = runScript('validate', 'validate-jira-user-story.mjs', ['--only', issueId]);
        if (validateCode !== 0) return validateCode;
      } else {
        console.warn(`\nSkipped the Jira User story export: ${featurePath} is outside ${testcasesDir}.`);
      }

      return 0;
    } else if (command === 'upload-user-story' || command === 'upload' || command === 'sync-user-story') {
      const outputDir = path.resolve(__dirname, '../jira-user-story');
      const userStoryPath = findFileRecursively(outputDir, `${issueId}.txt`);

      if (!userStoryPath || !fs.existsSync(userStoryPath)) {
        console.error(`Error: Could not find exported user story file: ${issueId}.txt under ${outputDir}`);
        console.error(`Please run "node bin/jira-sync export ${issueId}" first to generate the text export.`);
        return 1;
      }

      console.log(`Reading exported user story text from: ${userStoryPath}`);
      const userStoryText = fs.readFileSync(userStoryPath, 'utf8');

      // Upload to the configured Jira user-story field.
      await jiraService.updateUserStoryField(issueId, userStoryText);
      return 0;
    } else if (command === 'create-zephyr-tests' || command === 'zephyr') {
      const featurePath = resolveFeaturePath(issueId, positional[2]);
      if (!featurePath) return 1;

      console.log(`Reading test case file from: ${featurePath}`);
      const gherkinContent = fs.readFileSync(featurePath, 'utf8');

      // Strategy gate: a non-conforming feature file must never reach Jira
      const lintResult = lintIssue({ issueId, featurePath, content: gherkinContent, repoRoot: REPO_ROOT });
      console.log(formatLintReport(lintResult, featurePath));

      if (lintResult.errors.length > 0 && !force) {
        console.error(`\nAborted: ${lintResult.errors.length} strategy error(s) in the feature file.`);
        console.error(`Fix them, or re-run with --force if you intentionally want to create Zephyr tests as-is.`);
        return 1;
      }
      if (lintResult.errors.length > 0 && force) {
        console.warn(`\n[--force] Creating Zephyr tests despite ${lintResult.errors.length} strategy error(s).`);
      }

      const filterMsg = scenarioFilter ? `, filter: "${scenarioFilter}"` : '';
      console.log(`\nCreating Zephyr Test Cases on JIRA for issue ${issueId} (prefix: "${prefix}", levels: "${testLevels.join(', ')}", assignee: ${assignee ? `"${assignee}"` : 'none'}${filterMsg})...`);
      const result = await jiraService.createZephyrTestsFromFeature(issueId, gherkinContent, prefix, testLevels, assignee, scenarioFilter);
      console.log(`\nSuccessfully processed ${result.count} Zephyr Test Case(s):`);
      result.testCaseKeys.forEach(key => console.log(`  - ${key}`));

      return 0;
    } else {
      console.error(`Error: Unknown command "${command}"`);
      showUsage();
      return 1;
    }
  } catch (err) {
    console.error(`CLI Execution failed: ${err.message}`);
    return 1;
  }
}

module.exports = { run };
