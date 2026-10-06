const fs = require('fs');
const path = require('path');

const REPOSITORY_ROOT = path.resolve(__dirname, '../..');

function getProjectRoot() {
  return process.env.TESTCASE_AGENT_ROOT
    ? path.resolve(process.env.TESTCASE_AGENT_ROOT)
    : REPOSITORY_ROOT;
}

function loadFileConfig() {
  const root = getProjectRoot();
  const configPath = process.env.TESTCASE_AGENT_CONFIG
    ? path.resolve(process.env.TESTCASE_AGENT_CONFIG)
    : path.join(root, 'testcase-agent.config.json');

  if (!fs.existsSync(configPath)) return {};
  return JSON.parse(fs.readFileSync(configPath, 'utf8'));
}

function loadConfig() {
  const file = loadFileConfig();
  const jira = file.jira || {};

  return {
    projectRoot: getProjectRoot(),
    jiraBaseUrl: process.env.JIRA_BASE_URL || jira.baseUrl || '',
    pemPath: process.env.JIRA_PEM_PATH || jira.pemPath,
    acceptanceCriteriaField: process.env.JIRA_AC_FIELD || jira.acceptanceCriteriaField || 'acceptanceCriteria',
    bddField: process.env.JIRA_BDD_FIELD || jira.bddField || 'bdd',
    userStoryEndpoint: process.env.JIRA_USER_STORY_ENDPOINT || jira.userStoryEndpoint || '/rest/jbehave-for-jira/1.0/stories/{issueId}?comment=updated%20by%20testcase-agent',
    testIssueType: process.env.JIRA_TEST_ISSUE_TYPE || jira.testIssueType || 'Test',
    testLevelField: process.env.JIRA_TEST_LEVEL_FIELD || jira.testLevelField || '',
    testLevels: jira.testLevels || {},
  };
}

module.exports = { loadConfig, getProjectRoot };
