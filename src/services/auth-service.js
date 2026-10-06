/**
 * Auth Service - Standalone reader for loading credentials from project auth.json,
 * global auth.json (~/.testcase-agent/auth.json), and an optional local env.txt fallback.
 */

const fs = require('fs');
const path = require('path');
const os = require('os');

const REPOSITORY_ROOT = path.resolve(__dirname, '../..');

/**
 * Directories searched for a project-level `auth.json` or `env.txt`, in
 * precedence order: the configured project root, working directory, and this checkout.
 *
 * `TESTCASE_AGENT_ROOT` pins the search to a single directory instead. Set it to
 * run the CLI against a config root outside the checkout — and in tests, so a
 * real `auth.json` sitting in the repository cannot leak into the run.
 * @returns {string[]}
 */
function getProjectSearchRoots() {
  if (process.env.TESTCASE_AGENT_ROOT) {
    return [path.resolve(process.env.TESTCASE_AGENT_ROOT)];
  }

  return [
    process.cwd(),
    REPOSITORY_ROOT
  ];
}

/**
 * Finds the project-level auth.json path.
 * @returns {string|null}
 */
function getProjectAuthFilePath() {
  return getProjectSearchRoots()
    .map(root => path.join(root, 'auth.json'))
    .find(candidate => fs.existsSync(candidate)) || null;
}

/**
 * Finds the global-level auth.json path in the user's home directory.
 * @returns {string|null}
 */
function getGlobalAuthFilePath() {
  const possiblePaths = [path.join(os.homedir(), '.testcase-agent', 'auth.json')];

  return possiblePaths.find(p => fs.existsSync(p)) || null;
}

/**
 * Loads credentials for a specific tool from a given auth file path.
 * @param {string} authFilePath - Path to the auth.json file
 * @param {string} toolName - Name of the tool (e.g., 'jira')
 * @returns {Object|null} Credentials object
 */
function loadAuthFromFile(authFilePath, toolName) {
  if (!authFilePath || !fs.existsSync(authFilePath)) {
    return null;
  }

  try {
    const rawContent = fs.readFileSync(authFilePath, 'utf8');
    const authData = JSON.parse(rawContent);

    if (authData[toolName]) {
      return authData[toolName];
    }
    
    // Check confluence key as fallback if requesting jira
    if (toolName === 'jira' && authData['confluence']) {
      return authData['confluence'];
    }

  } catch (error) {
    console.warn(`[Auth] Warning: Failed to load auth file from ${authFilePath}: ${error.message}`);
  }

  return null;
}

/**
 * Parses the local env.txt as a fallback authentication source
 * @returns {Object|null}
 */
function parseLocalEnv() {
  const envPath = getProjectSearchRoots()
    .map(root => path.join(root, 'env.txt'))
    .find(candidate => fs.existsSync(candidate));

  if (!envPath) {
    return null;
  }

  try {
    const envContent = fs.readFileSync(envPath, 'utf8');
    const credentials = {};
    
    envContent.split(/\r?\n/).forEach(line => {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) return;
      const match = trimmed.match(/^([^=]+)=(.*)$/);
      if (match) {
        let key = match[1].trim();
        let val = match[2].trim();
        if (val.startsWith('"') && val.endsWith('"')) {
          val = val.slice(1, -1);
        } else if (val.startsWith("'") && val.endsWith("'")) {
          val = val.slice(1, -1);
        }
        credentials[key] = val;
      }
    });

    console.log(`[Auth Fallback] Successfully loaded local env.txt from: ${envPath}`);
    return credentials;
  } catch (err) {
    console.warn(`[Auth Fallback] Warning: Failed to parse local env.txt: ${err.message}`);
    return null;
  }
}

/**
 * Converts credentials to headers format.
 * @param {Object} credentials - Credentials object
 * @returns {Object} Headers containing Authorization
 */
function getAuthHeadersFromCredentials(credentials) {
  const headers = {};
  if (!credentials) {
    return headers;
  }

  // Handle standard Personal Access Token (PAT)
  if (credentials.token || credentials.pat) {
    const pat = credentials.token || credentials.pat;
    const user = credentials.user;
    
    if (user) {
      const basic = Buffer.from(`${user}:${pat}`).toString('base64');
      headers['Authorization'] = `Basic ${basic}`;
    } else {
      headers['Authorization'] = `Bearer ${pat}`;
    }
  } 
  // Handle raw basic credentials (username + password)
  else if (credentials.user && credentials.password) {
    const basic = Buffer.from(`${credentials.user}:${credentials.password}`).toString('base64');
    headers['Authorization'] = `Basic ${basic}`;
  }

  return headers;
}

/**
 * Loads credentials for a specific tool based on selected source.
 * @param {string} source - 'project', 'global', or 'env'
 * @param {string} toolName - Name of the tool (e.g. 'jira')
 * @returns {Object} Request headers containing Auth details
 */
function getAuthHeadersForSource(source, toolName) {
  if (!source) {
    return {};
  }

  if (source === 'project') {
    const projectPath = getProjectAuthFilePath();
    if (projectPath) {
      const creds = loadAuthFromFile(projectPath, toolName);
      if (creds) {
        return getAuthHeadersFromCredentials(creds);
      }
    }
  } else if (source === 'global') {
    const globalPath = getGlobalAuthFilePath();
    if (globalPath) {
      const creds = loadAuthFromFile(globalPath, toolName);
      if (creds) {
        return getAuthHeadersFromCredentials(creds);
      }
    }
  } else if (source === 'env') {
    const localEnv = parseLocalEnv();
    if (localEnv) {
      const creds = {
        user: localEnv.username || localEnv.user,
        password: localEnv.pin || localEnv.password,
        token: localEnv.token || localEnv.pat
      };
      return getAuthHeadersFromCredentials(creds);
    }
  }

  return {};
}

/**
 * Determines the initial authentication source to use.
 * @param {string} toolName - Name of the tool (e.g., 'jira')
 * @returns {string|null} 'project', 'global', 'env', or null
 */
function getInitialAuthSource(toolName) {
  const projectPath = getProjectAuthFilePath();
  if (projectPath && loadAuthFromFile(projectPath, toolName)) {
    return 'project';
  }

  const globalPath = getGlobalAuthFilePath();
  if (globalPath && loadAuthFromFile(globalPath, toolName)) {
    return 'global';
  }

  if (parseLocalEnv()) {
    return 'env';
  }

  return null;
}

/**
 * Checks if both project and global auth files exist and have different credentials for the tool.
 * @param {string} toolName - Name of the tool (e.g., 'jira')
 * @returns {boolean} True if both exist and differ
 */
function areAuthCredentialsDifferent(toolName) {
  const projectPath = getProjectAuthFilePath();
  const globalPath = getGlobalAuthFilePath();
  if (!projectPath || !globalPath) {
    return false;
  }

  const projectCreds = loadAuthFromFile(projectPath, toolName);
  const globalCreds = loadAuthFromFile(globalPath, toolName);
  if (!projectCreds || !globalCreds) {
    return false;
  }

  return JSON.stringify(projectCreds) !== JSON.stringify(globalCreds);
}

/**
 * Backward compatible getAuthHeaders helper that resolves initial auth source
 * @param {string} toolName - Name of the tool
 * @returns {Object} Request headers
 */
function getAuthHeaders(toolName) {
  const source = getInitialAuthSource(toolName);
  if (!source) {
    console.log(`[Auth] No authentication credentials found!`);
    return {};
  }
  console.log(`[Auth] Loading initial credentials from source: "${source}"`);
  return getAuthHeadersForSource(source, toolName);
}

module.exports = {
  getProjectSearchRoots,
  getProjectAuthFilePath,
  getGlobalAuthFilePath,
  loadAuthFromFile,
  getAuthHeadersFromCredentials,
  getAuthHeadersForSource,
  getInitialAuthSource,
  areAuthCredentialsDifferent,
  getAuthHeaders
};
