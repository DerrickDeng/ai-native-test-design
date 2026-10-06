#!/usr/bin/env node
/**
 * Prepare and collect one isolated eval run for the functional-test-design skill.
 *
 *   node prepare-run.mjs prepare --fixture <name> --skill <skill dir> --dest <run dir> [--base <dir>]
 *   node prepare-run.mjs collect --dest <run dir> --issue <ISSUE_ID>
 *
 * `prepare` builds <dest>/repo: the CLI, AGENTS.md, the fixture's requirements and
 * testcases, and the skill under test at <dest>/repo/skill-under-test. Pass the
 * current skill or a snapshot of an older version as --skill to compare them.
 * --base names a directory holding bin/, src/, package.json and AGENTS.md to use
 * instead of the current ones, so an older version runs with its own CLI and rules.
 *
 * `collect` copies the deliverables into <dest>/outputs and stores the lint
 * result of --issue in outputs/lint.txt. It always lints with the current CLI, so
 * every version is judged by the same rules.
 */

import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const repositoryRoot = path.resolve(here, '..', '..', '..');
const fixturesRoot = path.join(here, 'files');

function parseArgs(argv) {
  const [command, ...rest] = argv;
  const options = {};
  for (let i = 0; i < rest.length; i += 2) options[rest[i].replace(/^--/, '')] = rest[i + 1];
  return { command, options };
}

function require_(options, ...names) {
  for (const name of names) {
    if (!options[name]) throw new Error(`Missing --${name}`);
  }
}

function copy(source, destination, filter) {
  fs.mkdirSync(path.dirname(destination), { recursive: true });
  fs.cpSync(source, destination, { recursive: true, filter });
}

function prepare({ fixture, skill, dest, base }) {
  const fixtureDir = path.join(fixturesRoot, fixture);
  if (!fs.existsSync(fixtureDir)) throw new Error(`Unknown fixture: ${fixture}`);
  const repo = path.resolve(dest, 'repo');
  if (fs.existsSync(repo)) throw new Error(`Run directory already exists: ${repo}`);

  const baseRoot = base ? path.resolve(base) : repositoryRoot;
  ['bin', 'src', 'package.json', 'AGENTS.md'].forEach(entry => {
    copy(path.join(baseRoot, entry), path.join(repo, entry));
  });
  fs.mkdirSync(path.join(repo, 'testcases'), { recursive: true });
  copy(fixtureDir, repo);

  // A fetch would have stored a dated raw snapshot. Give each formatted file a raw twin.
  const requirementsDir = path.join(repo, 'requirements');
  for (const issue of fs.readdirSync(requirementsDir)) {
    const dir = path.join(requirementsDir, issue);
    for (const name of fs.readdirSync(dir)) {
      if (!name.endsWith('-formatted.md')) continue;
      const raw = path.join(dir, name.replace(/-formatted\.md$/, '.md'));
      if (!fs.existsSync(raw)) fs.copyFileSync(path.join(dir, name), raw);
    }
  }

  copy(path.resolve(skill), path.join(repo, 'skill-under-test'), candidate => path.basename(candidate) !== 'evals');
  fs.mkdirSync(path.resolve(dest, 'outputs'), { recursive: true });
  console.log(repo);
}

function collect({ dest, issue }) {
  const repo = path.resolve(dest, 'repo');
  const outputs = path.resolve(dest, 'outputs');
  fs.mkdirSync(outputs, { recursive: true });
  ['testcases', 'requirements'].forEach(entry => {
    fs.rmSync(path.join(outputs, entry), { recursive: true, force: true });
    if (fs.existsSync(path.join(repo, entry))) copy(path.join(repo, entry), path.join(outputs, entry));
  });

  // Lint in a copy that pairs the run's files with the current CLI.
  const grading = path.resolve(dest, 'grading-repo');
  fs.rmSync(grading, { recursive: true, force: true });
  ['bin', 'src', 'package.json'].forEach(entry => copy(path.join(repositoryRoot, entry), path.join(grading, entry)));
  ['testcases', 'requirements'].forEach(entry => copy(path.join(repo, entry), path.join(grading, entry)));
  const lint = spawnSync(process.execPath, ['bin/jira-sync', 'lint', issue], { cwd: grading, encoding: 'utf8' });
  fs.writeFileSync(path.join(outputs, 'lint.txt'), `exit code: ${lint.status}\n${lint.stdout}${lint.stderr}`);
  fs.rmSync(grading, { recursive: true, force: true });
  console.log(`lint exit code ${lint.status}`);
}

try {
  const { command, options } = parseArgs(process.argv.slice(2));
  if (command === 'prepare') {
    require_(options, 'fixture', 'skill', 'dest');
    prepare(options);
  } else if (command === 'collect') {
    require_(options, 'dest', 'issue');
    collect(options);
  } else {
    throw new Error('Usage: prepare-run.mjs prepare|collect ...');
  }
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
