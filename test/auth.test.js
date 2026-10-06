const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');
const os = require('os');

// Keep original methods to restore after tests
const originalCwd = process.cwd;
const originalHomedir = os.homedir;

// Import our modules
const authService = require('../src/services/auth-service');
const JiraService = require('../src/services/jira-service');
const HttpClient = require('../src/utils/http-client');

test.describe('Auth Service & JiraService Fallback Tests', () => {
  let tempDir;

  test.beforeEach(() => {
    // Create a unique temporary directory for each test
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'testcase-agent-auth-'));

    // Stub process.cwd and os.homedir to point to our isolated temp directory
    process.cwd = () => tempDir;
    os.homedir = () => tempDir;

    // Stubbing cwd is not enough: the project search also covers this checkout,
    // so a real auth.json at the repository root would leak into every test.
    // Pinning TESTCASE_AGENT_ROOT restricts the search to the temp directory.
    process.env.TESTCASE_AGENT_ROOT = tempDir;
  });

  test.afterEach(() => {
    // Restore original functions
    process.cwd = originalCwd;
    os.homedir = originalHomedir;
    delete process.env.TESTCASE_AGENT_ROOT;

    // Clean up temporary directory
    fs.rmSync(tempDir, { recursive: true, force: true });

    // Clean up any test artifacts in requirements directory
    const testReqDir = path.resolve(__dirname, '../requirements/DEMO-1234');
    if (fs.existsSync(testReqDir)) {
      fs.rmSync(testReqDir, { recursive: true, force: true });
    }
  });

  test.it('should return null when no auth file exists', () => {
    assert.strictEqual(authService.getProjectAuthFilePath(), null);
    assert.strictEqual(authService.getGlobalAuthFilePath(), null);
    assert.strictEqual(authService.getInitialAuthSource('jira'), null);
  });

  test.it('should resolve project-level auth.json when it exists', () => {
    const projectAuthPath = path.join(tempDir, 'auth.json');
    const authContent = {
      jira: {
        token: 'project-token-123'
      }
    };
    fs.writeFileSync(projectAuthPath, JSON.stringify(authContent), 'utf8');

    assert.strictEqual(authService.getProjectAuthFilePath(), projectAuthPath);
    assert.strictEqual(authService.getGlobalAuthFilePath(), null);
    assert.strictEqual(authService.getInitialAuthSource('jira'), 'project');

    const headers = authService.getAuthHeadersForSource('project', 'jira');
    assert.strictEqual(headers['Authorization'], 'Bearer project-token-123');
  });

  test.it('should resolve global-level auth.json when it exists and project-level does not', () => {
    const globalDir = path.join(tempDir, '.testcase-agent');
    fs.mkdirSync(globalDir, { recursive: true });

    const globalAuthPath = path.join(globalDir, 'auth.json');
    const authContent = {
      jira: {
        token: 'global-token-456'
      }
    };
    fs.writeFileSync(globalAuthPath, JSON.stringify(authContent), 'utf8');

    assert.strictEqual(authService.getProjectAuthFilePath(), null);
    assert.strictEqual(authService.getGlobalAuthFilePath(), globalAuthPath);
    assert.strictEqual(authService.getInitialAuthSource('jira'), 'global');

    const headers = authService.getAuthHeadersForSource('global', 'jira');
    assert.strictEqual(headers['Authorization'], 'Bearer global-token-456');
  });

  test.it('should fallback to local env.txt when neither auth.json exists', () => {
    const envPath = path.join(tempDir, 'env.txt');
    fs.writeFileSync(envPath, 'token=env-token-789\nusername=test-user', 'utf8');

    assert.strictEqual(authService.getProjectAuthFilePath(), null);
    assert.strictEqual(authService.getGlobalAuthFilePath(), null);
    assert.strictEqual(authService.getInitialAuthSource('jira'), 'env');

    const headers = authService.getAuthHeadersForSource('env', 'jira');
    const expectedBasic = Buffer.from('test-user:env-token-789').toString('base64');
    assert.strictEqual(headers['Authorization'], `Basic ${expectedBasic}`);
  });

  test.it('should detect when project and global credentials are different', () => {
    // 1. Create project auth
    const projectAuthPath = path.join(tempDir, 'auth.json');
    fs.writeFileSync(projectAuthPath, JSON.stringify({ jira: { token: 'token-A' } }), 'utf8');

    // 2. Create global auth
    const globalDir = path.join(tempDir, '.testcase-agent');
    fs.mkdirSync(globalDir, { recursive: true });
    const globalAuthPath = path.join(globalDir, 'auth.json');
    fs.writeFileSync(globalAuthPath, JSON.stringify({ jira: { token: 'token-B' } }), 'utf8');

    // They are different
    assert.strictEqual(authService.areAuthCredentialsDifferent('jira'), true);

    // 3. Make them the same
    fs.writeFileSync(globalAuthPath, JSON.stringify({ jira: { token: 'token-A' } }), 'utf8');
    assert.strictEqual(authService.areAuthCredentialsDifferent('jira'), false);
  });

  test.it('should initialize JiraService with fallback capability when credentials differ', () => {
    // Create different project and global credentials
    fs.writeFileSync(path.join(tempDir, 'auth.json'), JSON.stringify({ jira: { token: 'project-token' } }), 'utf8');

    const globalDir = path.join(tempDir, '.testcase-agent');
    fs.mkdirSync(globalDir, { recursive: true });
    fs.writeFileSync(path.join(globalDir, 'auth.json'), JSON.stringify({ jira: { token: 'global-token' } }), 'utf8');

    const jiraService = new JiraService();
    assert.strictEqual(jiraService.currentAuthSource, 'project');
    assert.strictEqual(jiraService.canFallbackToGlobal, true);
    assert.strictEqual(jiraService.client.defaultHeaders['Authorization'], 'Bearer project-token');
  });

  test.it('should fallback and retry upon 401 when fallback is possible', async () => {
    // Set up project and global credentials
    fs.writeFileSync(path.join(tempDir, 'auth.json'), JSON.stringify({ jira: { token: 'project-token' } }), 'utf8');

    const globalDir = path.join(tempDir, '.testcase-agent');
    fs.mkdirSync(globalDir, { recursive: true });
    fs.writeFileSync(path.join(globalDir, 'auth.json'), JSON.stringify({ jira: { token: 'global-token' } }), 'utf8');

    const jiraService = new JiraService();

    // Mock HttpClient get to throw 401 on first call, succeed on second
    const originalGet = HttpClient.prototype.get;
    let getCallCount = 0;
    let usedAuthorizationHeader = null;

    HttpClient.prototype.get = async function(pathUrl, options) {
      getCallCount++;
      usedAuthorizationHeader = this.defaultHeaders['Authorization'];
      if (getCallCount === 1) {
        const error = new Error('HTTP Error 401 Unauthorized');
        error.statusCode = 401;
        throw error;
      }
      return {
        fields: {
          summary: 'Fallback Issue Title',
          description: 'Fallback Description',
          acceptanceCriteria: 'Fallback Acceptance Criteria'
        }
      };
    };

    try {
      const issue = await jiraService.fetchIssue('DEMO-1234');

      assert.strictEqual(getCallCount, 2);
      assert.strictEqual(jiraService.currentAuthSource, 'global');
      assert.strictEqual(jiraService.canFallbackToGlobal, false);
      assert.strictEqual(jiraService.client.defaultHeaders['Authorization'], 'Bearer global-token');
      assert.strictEqual(usedAuthorizationHeader, 'Bearer global-token');
      assert.strictEqual(issue.title, 'Fallback Issue Title');
    } finally {
      // Restore original HttpClient method
      HttpClient.prototype.get = originalGet;
    }
  });

  test.it('should throw original 401 if global fallback is not available', async () => {
    // Only project credentials exist, no global credentials
    fs.writeFileSync(path.join(tempDir, 'auth.json'), JSON.stringify({ jira: { token: 'project-token' } }), 'utf8');

    const jiraService = new JiraService();
    assert.strictEqual(jiraService.canFallbackToGlobal, false);

    const originalGet = HttpClient.prototype.get;
    let getCallCount = 0;

    HttpClient.prototype.get = async function(pathUrl, options) {
      getCallCount++;
      const error = new Error('HTTP Error 401 Unauthorized');
      error.statusCode = 401;
      throw error;
    };

    try {
      await assert.rejects(async () => {
        await jiraService.fetchIssue('DEMO-1234');
      }, (err) => {
        assert.strictEqual(err.statusCode, 401);
        return true;
      });
      assert.strictEqual(getCallCount, 1);
    } finally {
      HttpClient.prototype.get = originalGet;
    }
  });

  test.it('should correctly parse issue ID from URL or raw string', () => {
    const jiraService = new JiraService();
    assert.strictEqual(jiraService.parseIssueId('https://jira.example.com/browse/DEMO-8499'), 'DEMO-8499');
    assert.strictEqual(jiraService.parseIssueId('DEMO-8499'), 'DEMO-8499');
    assert.strictEqual(jiraService.parseIssueId('demo-8499'), 'DEMO-8499');
  });

  test.it('should upload Gherkin scenarios to JBehave for Jira REST API', async () => {
    fs.writeFileSync(path.join(tempDir, 'auth.json'), JSON.stringify({ jira: { token: 'project-token' } }), 'utf8');

    const jiraService = new JiraService();

    // Stub client.post
    const originalPost = HttpClient.prototype.post;
    let postPayload = null;
    let postPath = null;

    HttpClient.prototype.post = async function(pathUrl, body, options) {
      postPath = pathUrl;
      postPayload = body;
      return { success: true, kind: 'success' };
    };

    try {
      const gherkinText = 'Scenario: User logs in\nGiven user is logged in';
      await jiraService.updateUserStoryField('DEMO-1234', gherkinText);
      assert.strictEqual(postPath, '/rest/jbehave-for-jira/1.0/stories/DEMO-1234?comment=updated%20by%20testcase-agent');
      assert.strictEqual(postPayload.issueKey, 'DEMO-1234');
      assert.strictEqual(postPayload.content, gherkinText);
    } finally {
      HttpClient.prototype.post = originalPost;
    }
  });

});
