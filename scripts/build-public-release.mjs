#!/usr/bin/env node

import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

const SOURCE_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const PUBLIC_ENTRIES = [
  '.claude/skills',
  '.codex/skills',
  '.gemini/skills',
  '.github',
  '.gitignore',
  'AGENTS.md',
  'CLAUDE.md',
  'GEMINI.md',
  'README.md',
  'auth.json.example',
  'bin',
  'docs',
  'examples/online-store',
  'package.json',
  'requirements',
  'scripts',
  'skills',
  'src',
  'test',
  'testcase-agent.config.example.json',
  'testcases',
  'wiki'
];

const IGNORED_NAMES = new Set(['.DS_Store']);
const ALLOWED_URL_HOSTS = new Set(['127.0.0.1', 'localhost', 'json-schema.org', 'www.w3.org']);
const SYNTHETIC_KEY_PREFIXES = new Set(['ACC', 'DEMO', 'DRAFT', 'E2E', 'LAB', 'QAD']);
// Tokens shaped like issue keys that are not issue keys: AC-01, SHA-256, UTF-8.
const NON_ISSUE_PREFIXES = new Set(['AC', 'SHA', 'UTF']);

function createDestination() {
  if (process.argv[2]) {
    const requested = path.resolve(process.argv[2]);
    if (fs.existsSync(requested)) {
      throw new Error(`Destination already exists: ${requested}`);
    }
    fs.mkdirSync(requested, { recursive: true });
    return requested;
  }

  return fs.mkdtempSync(path.join(os.tmpdir(), 'bdd-testcase-agent-public-'));
}

// Copies only Git-tracked files, so ignored local state (wiki/.local, wiki/.venv,
// models, credentials) never reaches the release even inside an allowlisted folder.
function copyEntry(relativePath, destinationRoot) {
  const tracked = execFileSync('git', ['ls-files', '-z', '--', relativePath], { cwd: SOURCE_ROOT, encoding: 'utf8' })
    .split('\0')
    .filter(Boolean)
    .filter(file => !IGNORED_NAMES.has(path.basename(file)));
  if (tracked.length === 0) {
    throw new Error(`Public allowlist entry has no tracked files: ${relativePath}`);
  }

  for (const file of tracked) {
    const destination = path.join(destinationRoot, file);
    fs.mkdirSync(path.dirname(destination), { recursive: true });
    fs.copyFileSync(path.join(SOURCE_ROOT, file), destination);
  }
}

function walkFiles(root) {
  const files = [];
  for (const entry of fs.readdirSync(root, { withFileTypes: true })) {
    if (IGNORED_NAMES.has(entry.name)) continue;
    const fullPath = path.join(root, entry.name);
    if (entry.isDirectory()) files.push(...walkFiles(fullPath));
    if (entry.isFile()) files.push(fullPath);
  }
  return files;
}

function inspectRelease(root) {
  const findings = [];
  const forbiddenFiles = new Set(['auth.json', 'env.txt']);

  for (const filePath of walkFiles(root)) {
    const relativePath = path.relative(root, filePath);
    const basename = path.basename(filePath);
    if (forbiddenFiles.has(basename)) {
      findings.push(`${relativePath}: forbidden credential filename`);
      continue;
    }

    if (/\.(png|jpe?g|gif|webp|pdf|zip)$/i.test(basename)) {
      findings.push(`${relativePath}: binary artifact is not allowlisted`);
      continue;
    }

    const content = fs.readFileSync(filePath, 'utf8');
    const issueKeyPattern = new RegExp('\\b([A-Z]{2,' + '10})-(\\d+)\\b', 'g');
    for (const match of content.matchAll(issueKeyPattern)) {
      if (!SYNTHETIC_KEY_PREFIXES.has(match[1]) && !NON_ISSUE_PREFIXES.has(match[1])) {
        findings.push(`${relativePath}: non-synthetic issue key ${match[0]}`);
      }
    }

    for (const match of content.matchAll(/https?:\/\/[^\s)\]}>"']+/g)) {
      let host;
      try {
        host = new URL(match[0]).hostname;
      } catch {
        findings.push(`${relativePath}: malformed URL ${match[0]}`);
        continue;
      }
      const reservedExampleHost = host === 'example.com'
        || host.endsWith('.example.com')
        || host === 'example.invalid'
        || host.endsWith('.example.invalid');
      if (!reservedExampleHost && !ALLOWED_URL_HOSTS.has(host)) {
        findings.push(`${relativePath}: URL host is not allowlisted: ${host}`);
      }
    }
  }

  if (findings.length > 0) {
    throw new Error(`Public release inspection failed:\n- ${[...new Set(findings)].join('\n- ')}`);
  }
}

const destinationRoot = createDestination();
for (const entry of PUBLIC_ENTRIES) copyEntry(entry, destinationRoot);
inspectRelease(destinationRoot);

console.log(`Public release snapshot created: ${destinationRoot}`);
console.log('The snapshot contains allowlisted files only and has no Git history.');
