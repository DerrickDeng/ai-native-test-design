const fs = require('fs');
const path = require('path');
const HttpClient = require('../utils/http-client');
const { loadConfig } = require('../utils/config');
const { stripJiraDeleteMarkers } = require('../utils/content-filter');
const {
  parseFunctionalFeature,
  formatManualTestDescription
} = require('../domain/gherkin-testcases');
const {
  getInitialAuthSource,
  getAuthHeadersForSource,
  areAuthCredentialsDifferent
} = require('./auth-service');

function findDirRecursively(baseDir, targetDirName) {
  if (!fs.existsSync(baseDir)) return null;
  const entries = fs.readdirSync(baseDir, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.isDirectory()) {
      if (entry.name.toLowerCase() === targetDirName.toLowerCase()) {
        return path.join(baseDir, entry.name);
      }
      const found = findDirRecursively(path.join(baseDir, entry.name), targetDirName);
      if (found) {
        return found;
      }
    }
  }
  return null;
}

class JiraService {
  constructor() {
    const config = loadConfig();
    this.config = config;

    const source = getInitialAuthSource('jira');
    const authHeaders = getAuthHeadersForSource(source, 'jira');

    const headers = {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      ...authHeaders
    };

    this.client = new HttpClient({
      baseUrl: config.jiraBaseUrl,
      headers: headers,
      pemPath: config.pemPath
    });

    this.currentAuthSource = source;
    this.canFallbackToGlobal = (source === 'project' && areAuthCredentialsDifferent('jira'));
  }

  _switchToGlobalAuth() {
    const globalHeaders = getAuthHeadersForSource('global', 'jira');

    // Update client headers
    this.client.defaultHeaders = {
      ...this.client.defaultHeaders,
      ...globalHeaders
    };

    this.currentAuthSource = 'global';
    this.canFallbackToGlobal = false;
  }

  async _get(pathUrl, options = {}) {
    try {
      return await this.client.get(pathUrl, options);
    } catch (err) {
      if (err.statusCode === 401 && this.canFallbackToGlobal) {
        console.log(`[Auth Fallback] 401 Unauthorized encountered with project-level credentials. Retrying with global-level credentials...`);
        this._switchToGlobalAuth();
        return await this.client.get(pathUrl, options);
      }
      throw err;
    }
  }

  async _post(pathUrl, body, options = {}) {
    try {
      return await this.client.post(pathUrl, body, options);
    } catch (err) {
      if (err.statusCode === 401 && this.canFallbackToGlobal) {
        console.log(`[Auth Fallback] 401 Unauthorized encountered with project-level credentials. Retrying with global-level credentials...`);
        this._switchToGlobalAuth();
        return await this.client.post(pathUrl, body, options);
      }
      throw err;
    }
  }

  async _put(pathUrl, body, options = {}) {
    try {
      return await this.client.put(pathUrl, body, options);
    } catch (err) {
      if (err.statusCode === 401 && this.canFallbackToGlobal) {
        console.log(`[Auth Fallback] 401 Unauthorized encountered with project-level credentials. Retrying with global-level credentials...`);
        this._switchToGlobalAuth();
        return await this.client.put(pathUrl, body, options);
      }
      throw err;
    }
  }

  /**
   * Helper to parse issue ID from either URL or raw string
   * @param {string} input - Raw string or URL
   * @returns {string} Extracted issue ID (e.g. DEMO-8499)
   */
  parseIssueId(input) {
    if (!input) return '';
    const match = input.match(/([A-Z0-9]+-[0-9]+)/i);
    return match ? match[1].toUpperCase() : input.trim().toUpperCase();
  }

  /**
   * Updates the "User story" field of an issue by uploading it to the JIRA JBehave plugin.
   * The endpoint is adapter configuration because Jira plugins differ by installation.
   * @param {string} issueId - Issue ID
   * @param {string} userStoryText - The formatted Gherkin user story text to upload
   */
  async updateUserStoryField(issueId, userStoryText) {
    const cleanId = this.parseIssueId(issueId);
    const projectKey = cleanId.split('-')[0];
    console.log(`Uploading User story/BDD text to Jira JBehave plugin for Issue ${cleanId}...`);
    const pathUrl = this.config.userStoryEndpoint.replace('{issueId}', encodeURIComponent(cleanId));

    const payload = {
      issueKey: cleanId,
      projectKey: projectKey,
      version: '',
      content: userStoryText,
      metaInfo: {
        totalErrors: 0,
        totalWarnings: 0,
        totalUnknownSteps: 0,
        totalQuestionsUnanswered: 0,
        totalQuestions: 0,
        totalScenarios: 0,
        totalLines: 1
      }
    };

    try {
      // 1. Try POST request (JBehave create story endpoint)
      const response = await this._post(pathUrl, payload, { json: true });
      if (response && response.kind === 'failure' && response.message && response.message.includes('already exists')) {
        console.log(`Story already exists on JBehave. Retrying with PUT...`);
        await this._put(pathUrl, payload, { json: true });
      }
      console.log(`Successfully uploaded User story Gherkin scenarios to Jira JBehave plugin for Issue ${cleanId}!`);
    } catch (err) {
      // 2. If POST fails or throws (e.g. because story already exists), retry with PUT (JBehave update story endpoint)
      try {
        console.log(`POST failed (${err.message}). Attempting fallback with PUT...`);
        await this._put(pathUrl, payload, { json: true });
        console.log(`Successfully uploaded User story Gherkin scenarios (via PUT) to Jira JBehave plugin for Issue ${cleanId}!`);
      } catch (putErr) {
        console.error(`Error uploading to Jira JBehave plugin for Issue ${cleanId}: ${putErr.message}`);
        if (putErr.body) {
          console.error(`Response details: ${putErr.body}`);
        }
        throw putErr;
      }
    }
  }

  /**
   * Fetch details of a Jira Issue and write it to requirements folder
   * @param {string} issueId - E.g. DEMO-101 or full URL
   */
  async fetchIssue(issueId) {
    const cleanId = this.parseIssueId(issueId);
    console.log(`Fetching Jira Issue: ${cleanId}...`);
    const pathUrl = `/rest/api/2/issue/${cleanId}`;

    try {
      const issue = await this._get(pathUrl, { json: true });
      const fields = issue.fields || {};
      const title = fields.summary || '';
      const description = fields.description || '';
      const ac = fields[this.config.acceptanceCriteriaField] || '';
      const bdd = fields[this.config.bddField] || '';
      const attachments = fields.attachment || []; // Attachment metadata

      // Format requirement content, incorporating the custom Acceptance Criteria field
      let content = `title：${title}\n\ndescription：\n${description}\n`;
      if (ac) {
        const filteredAc = stripJiraDeleteMarkers(ac);
        if (filteredAc !== ac) {
          console.log(`[Content Filter] Removed Jira deletion markers from Acceptance Criteria`);
        }
        content += `\nAcceptance Criteria (AC)：\n${filteredAc}\n`;
      }

      // Extract and format attachment metadata for LLM
      if (attachments && attachments.length > 0) {
        content += `\nAttachments：\n`;
        attachments.forEach((attachment, index) => {
          content += `\n${index + 1}. Filename: ${attachment.filename}\n`;
          content += `   MIME Type: ${attachment.mimeType}\n`;
          content += `   Size: ${attachment.size} bytes\n`;
          content += `   URL: ${attachment.content}\n`;
          content += `   Uploaded: ${attachment.created}\n`;
        });
      }

      // Save to requirements directory
      const baseRequirementsDir = path.join(this.config.projectRoot, 'requirements');
      let reqDir = findDirRecursively(baseRequirementsDir, cleanId);
      if (!reqDir) {
        reqDir = path.join(baseRequirementsDir, cleanId);
        fs.mkdirSync(reqDir, { recursive: true });
      }

      // One dated file per fetch: <ISSUE_ID>-<YYYY-MM-DD>.md. Re-fetching on a
      // later day leaves the earlier snapshot in place as history.
      const fetchedOn = new Date().toISOString().slice(0, 10);
      const rawFileName = `${cleanId}-${fetchedOn}.md`;
      const reqFilePath = path.join(reqDir, rawFileName);
      fs.writeFileSync(reqFilePath, content, 'utf8');

      console.log(`Successfully fetched and saved requirements (including Acceptance Criteria, BDD, and Attachments) to ${reqFilePath}`);

      // Auto-download attachments (like screenshots) only if referenced in AC or Description
      if (attachments && attachments.length > 0) {
        const referencedAttachments = attachments.filter(attachment => {
          const isReferencedInAc = ac && ac.includes(attachment.filename);
          const isReferencedInDesc = description && description.includes(attachment.filename);
          return isReferencedInAc || isReferencedInDesc;
        });

        if (referencedAttachments.length > 0) {
          console.log(`Auto-downloading ${referencedAttachments.length} referenced attachment(s) to ${reqDir}...`);
          for (const attachment of referencedAttachments) {
            const savePath = path.join(reqDir, attachment.filename);
            try {
              await this.downloadAttachment(attachment.content, savePath);
              console.log(`  - Downloaded referenced attachment: ${attachment.filename}`);
            } catch (downloadErr) {
              console.warn(`  - [Warning] Failed to download attachment ${attachment.filename}: ${downloadErr.message}`);
            }
          }
        } else {
          console.log(`No attachments were referenced in the Acceptance Criteria or Description. Skipping download.`);
        }
      }

      console.log(`Next: copy it to ${cleanId}-${fetchedOn}-formatted.md and transcribe the copy using AGENTS.md and the functional-test-design skill.`);
      return { title, description, ac, bdd, attachments, fields };
    } catch (err) {
      console.error(`Error fetching Jira Issue ${cleanId}: ${err.message}`);
      if (err.body) {
        console.error(`Response details: ${err.body}`);
      }
      throw err;
    }
  }

  /**
   * Downloads a binary attachment from a full JIRA URL and saves it locally
   * @param {string} url - Full JIRA download URL
   * @param {string} savePath - Local file path to save the binary attachment
   * @returns {Promise<void>}
   */
  async downloadAttachment(url, savePath) {
    const fs = require('fs');
    const https = require('https');
    const { URL } = require('url');

    return new Promise((resolve, reject) => {
      try {
        const parsedUrl = new URL(url);
        const headers = {
          ...this.client.defaultHeaders
        };

        const options = {
          method: 'GET',
          headers,
          // Support bypassing unauthorized TLS if rejected by NODE_TLS_REJECT_UNAUTHORIZED env var
          rejectUnauthorized: process.env.NODE_TLS_REJECT_UNAUTHORIZED !== '0'
        };

        const fileStream = fs.createWriteStream(savePath);

        const req = https.request(url, options, (res) => {
          if (res.statusCode < 200 || res.statusCode >= 300) {
            fileStream.close();
            if (fs.existsSync(savePath)) {
              fs.unlinkSync(savePath); // Clean up partial/failed file
            }
            return reject(new Error(`Failed to download attachment, HTTP Status ${res.statusCode} on ${url}`));
          }

          res.pipe(fileStream);

          fileStream.on('finish', () => {
            fileStream.close();
            resolve();
          });
        });

        req.on('error', (err) => {
          fileStream.close();
          if (fs.existsSync(savePath)) {
            fs.unlinkSync(savePath);
          }
          reject(err);
        });

        req.end();
      } catch (err) {
        reject(err);
      }
    });
  }

  /**
   * Fetch components for an issue (or its parent if the issue is a sub-task and has no components).
   * @param {string} issueKey - The JIRA issue key (e.g., DEMO-7724)
   * @returns {Promise<Array>} List of components
   */
  async getComponentsForIssue(issueKey) {
    try {
      const issue = await this._get(`/rest/api/2/issue/${issueKey}`, { json: true });
      const fields = issue.fields || {};
      let components = fields.components || [];

      // If components is empty and there is a parent, try fetching the parent's components
      if (components.length === 0 && fields.parent && fields.parent.key) {
        console.log(`[Zephyr] Issue has no components. Fetching parent issue ${fields.parent.key} to inherit components...`);
        const parentIssue = await this._get(`/rest/api/2/issue/${fields.parent.key}`, { json: true });
        if (parentIssue.fields && parentIssue.fields.components) {
          components = parentIssue.fields.components;
          console.log(`[Zephyr] Inherited components from parent: ${components.map(c => c.name).join(', ')}`);
        }
      }

      return components.map(c => {
        const item = { id: c.id, name: c.name };
        if (c.self) item.self = c.self;
        return item;
      });
    } catch (err) {
      console.warn(`[Zephyr] Warning: Failed to fetch components for issue ${issueKey}: ${err.message}`);
      return [];
    }
  }

  /**
   * Search for an existing Test issue by project key and scenario name.
   * @param {string} projectKey
   * @param {string} scenarioName
   * @returns {Promise<Object|null>}
   */
  async searchExistingTestCase(projectKey, scenarioName) {
    const cleanedScenarioName = scenarioName.replace(/[\[\]]/g, '').replace(/"/g, '\\"');
    const jql = `project = ${projectKey} AND issuetype = Test AND summary ~ "${cleanedScenarioName}"`;
    const payload = {
      jql: jql,
      maxResults: 10,
      fields: ['key', 'id', 'summary']
    };
    try {
      const response = await this._post('/rest/api/2/search', payload, { json: true });
      const issues = response.issues || [];
      // Precise check: find an issue where summary equals scenarioName or ends with scenarioName
      for (const issue of issues) {
        const issueSummary = issue.fields.summary || '';
        if (issueSummary === scenarioName || issueSummary.endsWith(scenarioName)) {
          return issue;
        }
      }
      return null;
    } catch (err) {
      console.warn(`[Zephyr] Warning: Failed to search for existing test case in JQL search: ${err.message}`);
      return null;
    }
  }

  /**
   * Create or update a JIRA issue of type "Test".
   * @param {string} issueKey - E.g. "DEMO-7724"
   * @param {string} summary - Full summary including prefix
   * @param {string} scenarioName - Scenario name (used for idempotency)
   * @param {string} description
   * @param {Array} components
   * @param {string[]} [testLevels=['uat']] - Test levels
   * @param {string|null} [assignee=null] - Assignee name (or "current"/"me" to use currently logged-in user)
   * @returns {Promise<{testCaseKey: string, issueId: string, existed: boolean}>}
   */
  async createOrUpdateTestTicket(issueKey, summary, scenarioName, description, components = [], testLevels = ['uat'], assignee = null) {
    const projectKey = issueKey.split('-')[0];
    const existingTest = await this.searchExistingTestCase(projectKey, scenarioName);

    // Resolve assigneeName if provided
    let assigneeName = null;
    if (assignee) {
      if (assignee.toLowerCase() === 'current' || assignee.toLowerCase() === 'me') {
        const myself = await this.getMyself();
        if (myself && myself.name) {
          assigneeName = myself.name;
          console.log(`[Zephyr] Setting assignee to current user: ${assigneeName}`);
        }
      } else {
        assigneeName = assignee;
        console.log(`[Zephyr] Setting assignee to: ${assigneeName}`);
      }
    }

    // Test-level option ids and the target custom field are installation-specific.
    const allowedLevels = [];
    for (const lvl of testLevels) {
      const normalized = lvl.trim().toUpperCase();
      const mapped = this.config.testLevels[normalized];
      if (mapped) {
        allowedLevels.push({
          self: `${this.config.jiraBaseUrl.replace(/\/$/, '')}/rest/api/2/customFieldOption/${mapped.id}`,
          value: mapped.value,
          id: mapped.id,
          disabled: false
        });
      } else {
        const customMatch = lvl.match(/^([^:]+):(\d+)$/);
        if (customMatch) {
          allowedLevels.push({
            self: `${this.config.jiraBaseUrl.replace(/\/$/, '')}/rest/api/2/customFieldOption/${customMatch[2]}`,
            value: customMatch[1].toUpperCase(),
            id: customMatch[2],
            disabled: false
          });
        } else {
          console.warn(`[Zephyr] Warning: Test Level "${lvl}" is not configured and will be skipped.`);
        }
      }
    }

    if (this.config.testLevelField && allowedLevels.length === 0) {
      throw new Error('No requested test level is configured. Update testcase-agent.config.json before synchronizing tests.');
    }

    if (existingTest) {
      console.log(`[Zephyr] Existing Test Case found: ${existingTest.key}. Updating...`);
      const updateFields = {
        summary: summary,
        description: description
      };
      if (this.config.testLevelField) updateFields[this.config.testLevelField] = allowedLevels;
      if (components && components.length > 0) {
        updateFields.components = components;
      }

      const payload = {
        fields: updateFields
      };

      try {
        await this._put(`/rest/api/2/issue/${existingTest.key}`, payload, { json: true });
        return {
          testCaseKey: existingTest.key,
          issueId: existingTest.id,
          existed: true
        };
      } catch (err) {
        console.error(`[Zephyr] Error updating existing test case ${existingTest.key}: ${err.message}`);
        throw err;
      }
    } else {
      console.log(`[Zephyr] No existing Test Case found. Creating a new one under project ${projectKey}...`);

      const fields = {
        project: {
          key: projectKey
        },
        summary: summary,
        issuetype: {
          name: this.config.testIssueType
        },
        description: description
      };
      if (this.config.testLevelField) fields[this.config.testLevelField] = allowedLevels;

      if (assigneeName) {
        fields.assignee = {
          name: assigneeName
        };
      }

      if (components && components.length > 0) {
        fields.components = components;
      }

      const payload = { fields };

      try {
        const response = await this._post('/rest/api/2/issue', payload, { json: true });
        console.log(`[Zephyr] Successfully created Test Case issue: ${response.key}`);
        return {
          testCaseKey: response.key,
          issueId: response.id,
          existed: false
        };
      } catch (err) {
        console.error(`[Zephyr] Error creating Test Case issue: ${err.message}`);
        if (err.body) {
          console.error(`Response details: ${JSON.stringify(err.body)}`);
        }
        throw err;
      }
    }
  }

  /**
   * Fetch the current user profile from JIRA
   * @returns {Promise<Object|null>}
   */
  async getMyself() {
    try {
      return await this._get('/rest/api/2/myself', { json: true });
    } catch (err) {
      console.warn(`[Jira] Warning: Failed to get current user details from /rest/api/2/myself: ${err.message}`);
      return null;
    }
  }

  /**
   * Link the Test Case ticket to a sub-task or user story.
   * @param {string} subtaskKey - The issue key to link to
   * @param {string} testCaseKey - The test case issue key to link from
   */
  async linkTestCaseToSubtask(subtaskKey, testCaseKey) {
    const payload = {
      inwardIssue: {
        key: subtaskKey
      },
      outwardIssue: {
        key: testCaseKey
      },
      type: {
        name: 'Test Case',
        inward: 'has been tested by',
        outward: 'has test cases of'
      }
    };
    try {
      await this._post('/rest/api/2/issueLink', payload, { json: true });
      console.log(`[Zephyr] Linked Test Case ${testCaseKey} to parent issue/subtask ${subtaskKey}`);
    } catch (err) {
      console.error(`[Zephyr] Error linking test case to subtask: ${err.message}`);
      throw err;
    }
  }

  /**
   * Parse a BDD feature file and create/update Zephyr tests in JIRA.
   * @param {string} issueId - Subtask or User Story key
   * @param {string} gherkinContent - Feature file content
   * @param {string} [prefix='[Auto-Generated]'] - Prefix for the test case summaries
   * @param {string[]} [testLevels=['uat']] - Test levels
   * @param {string|null} [assignee=null] - Assignee name (or "current"/"me" to use currently logged-in user)
   * @param {string|null} [scenarioFilter=null] - Optional string to filter which scenarios are processed
   * @returns {Promise<{testCaseKeys: string[], count: number}>}
   */
  async createZephyrTestsFromFeature(issueId, gherkinContent, prefix = '[Auto-Generated]', testLevels = ['uat'], assignee = null, scenarioFilter = null) {
    const cleanId = this.parseIssueId(issueId);
    console.log(`[Zephyr] Starting Zephyr Test Case creation for parent: ${cleanId}`);

    // 1. Fetch components for the issue (or its parent if it is a sub-task)
    const components = await this.getComponentsForIssue(cleanId);

    // 2. Parse feature content
    const { feature, scenarios } = parseFunctionalFeature(gherkinContent);
    const featureName = feature.name || cleanId;
    const featureTags = feature.tags || [];

    console.log(`[Zephyr] Found ${scenarios.length} scenario(s) in feature "${featureName}"`);

    const createdKeys = [];

    for (const scenario of scenarios) {
      const scenarioName = scenario.name;

      if (scenarioFilter && !scenarioName.toLowerCase().includes(scenarioFilter.toLowerCase())) {
        console.log(`[Zephyr] Skipping scenario "${scenarioName}" because it does not match filter "${scenarioFilter}"`);
        continue;
      }

      const spacing = (prefix && !prefix.endsWith(' ')) ? ' ' : '';
      const testSummary = `${prefix}${spacing}${scenarioName}`;
      const testDescription = formatManualTestDescription(
        { name: featureName, tags: featureTags },
        scenario
      );

      console.log(`[Zephyr] Processing scenario: "${scenarioName}"`);

      // Create or update the test ticket
      const testTicket = await this.createOrUpdateTestTicket(cleanId, testSummary, scenarioName, testDescription, components, testLevels, assignee);

      // Link test case to the parent issueId
      await this.linkTestCaseToSubtask(cleanId, testTicket.testCaseKey);

      console.log(`[Zephyr] Successfully processed Test Case: ${this.config.jiraBaseUrl.replace(/\/$/, '')}/browse/${testTicket.testCaseKey}`);
      createdKeys.push(testTicket.testCaseKey);
    }

    return {
      testCaseKeys: createdKeys,
      count: createdKeys.length
    };
  }
}

module.exports = JiraService;
