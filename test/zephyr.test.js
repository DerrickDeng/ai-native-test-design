const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');
const os = require('os');

// Import modules
const JiraService = require('../src/services/jira-service');
const HttpClient = require('../src/utils/http-client');

test.describe('Zephyr Test Integration Tests', () => {
  let tempDir;
  let originalCwd;
  let originalHomedir;

  test.beforeEach(() => {
    originalCwd = process.cwd;
    originalHomedir = os.homedir;

    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'testcase-agent-zephyr-'));
    process.cwd = () => tempDir;
    os.homedir = () => tempDir;
    process.env.TESTCASE_AGENT_ROOT = tempDir;

    // Create fake project auth
    fs.writeFileSync(path.join(tempDir, 'auth.json'), JSON.stringify({ jira: { token: 'project-token' } }), 'utf8');
    fs.writeFileSync(path.join(tempDir, 'testcase-agent.config.json'), JSON.stringify({
      jira: {
        baseUrl: 'https://jira.example.com',
        testLevelField: 'customfield_10002',
        testLevels: {
          UAT: { id: '1', value: 'UAT' },
          REGRESSION: { id: '2', value: 'REGRESSION' }
        }
      }
    }), 'utf8');
  });

  test.afterEach(() => {
    process.cwd = originalCwd;
    os.homedir = originalHomedir;
    delete process.env.TESTCASE_AGENT_ROOT;
    fs.rmSync(tempDir, { recursive: true, force: true });
  });

  test.it('should fetch parent components if subtask components are empty', async () => {
    const jiraService = new JiraService();
    const originalGet = HttpClient.prototype.get;

    const gets = [];
    HttpClient.prototype.get = async function(pathUrl, options) {
      gets.push(pathUrl);
      if (pathUrl === '/rest/api/2/issue/DEMO-1235') {
        return {
          fields: {
            components: [],
            parent: { key: 'DEMO-1234' }
          }
        };
      }
      if (pathUrl === '/rest/api/2/issue/DEMO-1234') {
        return {
          fields: {
            components: [{ id: '101', name: 'UI-Component' }]
          }
        };
      }
      throw new Error(`Unexpected path URL: ${pathUrl}`);
    };

    try {
      const components = await jiraService.getComponentsForIssue('DEMO-1235');
      assert.strictEqual(components.length, 1);
      assert.strictEqual(components[0].id, '101');
      assert.strictEqual(components[0].name, 'UI-Component');
      assert.deepStrictEqual(gets, ['/rest/api/2/issue/DEMO-1235', '/rest/api/2/issue/DEMO-1234']);
    } finally {
      HttpClient.prototype.get = originalGet;
    }
  });

  test.it('should create or update Zephyr Test Cases and link them back', async () => {
    const featureText = `
@DEMO-1234
Feature: Custom report

  Scenario: Verify UI
    Given user is logged in
    Then page should load
    `;

    const jiraService = new JiraService();
    const originalGet = HttpClient.prototype.get;
    const originalPost = HttpClient.prototype.post;
    const originalPut = HttpClient.prototype.put;

    const gets = [];
    const posts = [];
    const puts = [];

    HttpClient.prototype.get = async function(pathUrl, options) {
      gets.push(pathUrl);
      if (pathUrl === '/rest/api/2/issue/DEMO-1234') {
        return {
          fields: {
            components: [{ id: '101', name: 'Reporting' }]
          }
        };
      }
      if (pathUrl === '/rest/api/2/myself') {
        return { name: 'testuser' };
      }
      throw new Error(`Unexpected GET: ${pathUrl}`);
    };

    HttpClient.prototype.post = async function(pathUrl, body, options) {
      posts.push({ pathUrl, body });
      if (pathUrl === '/rest/api/2/search') {
        return { issues: [] };
      }
      if (pathUrl === '/rest/api/2/issue') {
        return { key: 'DEMO-9001', id: '123456' };
      }
      return { success: true };
    };

    try {
      const result = await jiraService.createZephyrTestsFromFeature('DEMO-1234', featureText);

      // Verify overall result
      assert.strictEqual(result.count, 1);
      assert.deepStrictEqual(result.testCaseKeys, ['DEMO-9001']);

      // Check searches
      const searchPost = posts.find(p => p.pathUrl === '/rest/api/2/search');
      assert.ok(searchPost.body.jql.includes('summary ~ "Verify UI"'));

      // Check JIRA issue creation payload
      const issuePost = posts.find(p => p.pathUrl === '/rest/api/2/issue');
      assert.strictEqual(issuePost.body.fields.summary, '[Auto-Generated] Verify UI');
      assert.strictEqual(issuePost.body.fields.issuetype.name, 'Test');
      assert.strictEqual(issuePost.body.fields.assignee, undefined);
      assert.deepStrictEqual(issuePost.body.fields.components, [{ id: '101', name: 'Reporting' }]);
      assert.ok(issuePost.body.fields.description.includes('Feature: Custom report'));
      assert.ok(issuePost.body.fields.description.includes('Given user is logged in'));

      // Check links creation
      const linkPost = posts.find(p => p.pathUrl === '/rest/api/2/issueLink');
      assert.strictEqual(linkPost.body.inwardIssue.key, 'DEMO-1234');
      assert.strictEqual(linkPost.body.outwardIssue.key, 'DEMO-9001');
    } finally {
      HttpClient.prototype.get = originalGet;
      HttpClient.prototype.post = originalPost;
      HttpClient.prototype.put = originalPut;
    }
  });

  test.it('should update existing Zephyr Test Cases without recreating links', async () => {
    const featureText = `
@DEMO-1234
Feature: Custom report

  Scenario: Verify UI
    Given user is logged in
    Then page should load
    `;

    const jiraService = new JiraService();
    const originalGet = HttpClient.prototype.get;
    const originalPost = HttpClient.prototype.post;
    const originalPut = HttpClient.prototype.put;

    const gets = [];
    const posts = [];
    const puts = [];

    HttpClient.prototype.get = async function(pathUrl, options) {
      gets.push(pathUrl);
      if (pathUrl === '/rest/api/2/issue/DEMO-1234') {
        return {
          fields: {
            components: [{ id: '101', name: 'Reporting' }]
          }
        };
      }
      return { success: true };
    };

    HttpClient.prototype.post = async function(pathUrl, body, options) {
      posts.push({ pathUrl, body });
      if (pathUrl === '/rest/api/2/search') {
        return {
          issues: [{
            key: 'DEMO-9001',
            id: '123456',
            fields: { summary: '[Auto-Generated] Verify UI' }
          }]
        };
      }
      return { success: true };
    };

    HttpClient.prototype.put = async function(pathUrl, body, options) {
      puts.push({ pathUrl, body });
      return { success: true };
    };

    try {
      const result = await jiraService.createZephyrTestsFromFeature('DEMO-1234', featureText);

      // Verify overall result
      assert.strictEqual(result.count, 1);
      assert.deepStrictEqual(result.testCaseKeys, ['DEMO-9001']);

      // Check searches
      const searchPost = posts.find(p => p.pathUrl === '/rest/api/2/search');
      assert.ok(searchPost.body.jql.includes('summary ~ "Verify UI"'));

      // Check PUT issue updates
      assert.strictEqual(puts.length, 1);
      assert.strictEqual(puts[0].pathUrl, '/rest/api/2/issue/DEMO-9001');
      assert.deepStrictEqual(puts[0].body.fields.components, [{ id: '101', name: 'Reporting' }]);
      assert.ok(puts[0].body.fields.description.includes('Feature: Custom report'));

      // Check links creation
      const linkPost = posts.find(p => p.pathUrl === '/rest/api/2/issueLink');
      assert.strictEqual(linkPost.body.inwardIssue.key, 'DEMO-1234');
      assert.strictEqual(linkPost.body.outwardIssue.key, 'DEMO-9001');
    } finally {
      HttpClient.prototype.get = originalGet;
      HttpClient.prototype.post = originalPost;
      HttpClient.prototype.put = originalPut;
    }
  });

  test.it('should support dynamic prefix and parameterized multiple test levels', async () => {
    const featureText = `
@DEMO-1234
Feature: Custom report

  Scenario: Verify UI
    Given user is logged in
    Then page should load
    `;

    const jiraService = new JiraService();
    const originalGet = HttpClient.prototype.get;
    const originalPost = HttpClient.prototype.post;
    const originalPut = HttpClient.prototype.put;

    const gets = [];
    const posts = [];
    const puts = [];

    HttpClient.prototype.get = async function(pathUrl, options) {
      gets.push(pathUrl);
      if (pathUrl === '/rest/api/2/issue/DEMO-1234') {
        return { fields: { components: [] } };
      }
      return { success: true };
    };

    HttpClient.prototype.post = async function(pathUrl, body, options) {
      posts.push({ pathUrl, body });
      if (pathUrl === '/rest/api/2/search') {
        return { issues: [] };
      }
      if (pathUrl === '/rest/api/2/issue') {
        return { key: 'DEMO-9002', id: '123457' };
      }
      return { success: true };
    };

    try {
      const result = await jiraService.createZephyrTestsFromFeature('DEMO-1234', featureText, '[UAT-Custom]', ['UAT', 'REGRESSION']);

      assert.strictEqual(result.count, 1);
      assert.deepStrictEqual(result.testCaseKeys, ['DEMO-9002']);

      const issuePost = posts.find(p => p.pathUrl === '/rest/api/2/issue');
      assert.strictEqual(issuePost.body.fields.summary, '[UAT-Custom] Verify UI');

      // Check multiple test levels assigned correctly
      assert.strictEqual(issuePost.body.fields.customfield_10002.length, 2);
      assert.strictEqual(issuePost.body.fields.customfield_10002[0].value, 'UAT');
      assert.strictEqual(issuePost.body.fields.customfield_10002[0].id, '1');
      assert.strictEqual(issuePost.body.fields.customfield_10002[1].value, 'REGRESSION');
      assert.strictEqual(issuePost.body.fields.customfield_10002[1].id, '2');
    } finally {
      HttpClient.prototype.get = originalGet;
      HttpClient.prototype.post = originalPost;
      HttpClient.prototype.put = originalPut;
    }
  });

  test.it('should support explicit and dynamic assignee configuration', async () => {
    const featureText = `
@customReport
Feature: Custom report

  Scenario: Verify UI
    Given user is logged in
    `;

    const jiraService = new JiraService();
    const originalGet = HttpClient.prototype.get;
    const originalPost = HttpClient.prototype.post;

    const gets = [];
    const posts = [];

    HttpClient.prototype.get = async function(pathUrl, options) {
      gets.push(pathUrl);
      if (pathUrl === '/rest/api/2/issue/DEMO-1234') {
        return { fields: { components: [] } };
      }
      if (pathUrl === '/rest/api/2/myself') {
        return { name: 'testuser' };
      }
      throw new Error(`Unexpected GET: ${pathUrl}`);
    };

    HttpClient.prototype.post = async function(pathUrl, body, options) {
      posts.push({ pathUrl, body });
      if (pathUrl === '/rest/api/2/search') {
        return { issues: [] };
      }
      if (pathUrl === '/rest/api/2/issue') {
        return { key: 'DEMO-9002', id: '123457' };
      }
      return { success: true };
    };

    try {
      // 1. Explicit Assignee Name
      let result = await jiraService.createZephyrTestsFromFeature('DEMO-1234', featureText, '[Auto-Generated]', ['UAT'], 'demo-user');
      assert.strictEqual(result.count, 1);

      // 2. Dynamic 'me' assignee
      result = await jiraService.createZephyrTestsFromFeature('DEMO-1234', featureText, '[Auto-Generated]', ['UAT'], 'me');
      assert.strictEqual(result.count, 1);

      const issuePosts = posts.filter(p => p.pathUrl === '/rest/api/2/issue');
      assert.strictEqual(issuePosts.length, 2);
      assert.strictEqual(issuePosts[0].body.fields.assignee.name, 'demo-user');
      assert.strictEqual(issuePosts[1].body.fields.assignee.name, 'testuser');
    } finally {
      HttpClient.prototype.get = originalGet;
      HttpClient.prototype.post = originalPost;
    }
  });

  test.it('should support filtering scenarios by scenarioFilter', async () => {
    const featureText = `
Feature: Multi scenario feature

  Scenario: First scenario
    Given user is logged in

  Scenario: Second scenario
    Given user is logged in
    `;

    const jiraService = new JiraService();
    const originalGet = HttpClient.prototype.get;
    const originalPost = HttpClient.prototype.post;

    const posts = [];

    HttpClient.prototype.get = async function(pathUrl, options) {
      if (pathUrl === '/rest/api/2/issue/DEMO-1234') {
        return { fields: { components: [] } };
      }
      return { success: true };
    };

    HttpClient.prototype.post = async function(pathUrl, body, options) {
      posts.push({ pathUrl, body });
      if (pathUrl === '/rest/api/2/search') {
        return { issues: [] };
      }
      if (pathUrl === '/rest/api/2/issue') {
        return { key: 'DEMO-9002', id: '123457' };
      }
      return { success: true };
    };

    try {
      // Filter for 'Second' scenario
      const result = await jiraService.createZephyrTestsFromFeature('DEMO-1234', featureText, '[Auto-Generated]', ['UAT'], null, 'Second');
      assert.strictEqual(result.count, 1);

      const issuePost = posts.find(p => p.pathUrl === '/rest/api/2/issue');
      assert.ok(issuePost);
      assert.strictEqual(issuePost.body.fields.summary, '[Auto-Generated] Second scenario');
    } finally {
      HttpClient.prototype.get = originalGet;
      HttpClient.prototype.post = originalPost;
    }
  });
});
