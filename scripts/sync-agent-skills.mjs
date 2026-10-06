import { cp, mkdir, readFile, readdir, rm, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const canonicalRoot = path.join(repositoryRoot, "skills");
const mirrorRoots = [".codex/skills", ".claude/skills", ".gemini/skills"]
  .map((entry) => path.join(repositoryRoot, entry));
const checkOnly = process.argv.slice(2).includes("--check");

async function exists(target) {
  try {
    await stat(target);
    return true;
  } catch {
    return false;
  }
}

// Eval fixtures and prompts live beside a skill for maintainers. Agents do not need them.
const isSkillEvals = (root, absolute) => {
  const parts = path.relative(root, absolute).split(path.sep);
  return parts.length === 2 && parts[1] === "evals";
};

async function listFiles(root, current = root) {
  if (!await exists(current)) return [];
  const entries = await readdir(current, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const absolute = path.join(current, entry.name);
    if (isSkillEvals(root, absolute)) continue;
    if (entry.isDirectory()) {
      files.push(...await listFiles(root, absolute));
    } else if (entry.isFile()) {
      files.push(path.relative(root, absolute));
    }
  }
  return files.sort();
}

async function compareTrees(expectedRoot, actualRoot) {
  const expectedFiles = await listFiles(expectedRoot);
  const actualFiles = await listFiles(actualRoot);
  const differences = [];

  if (JSON.stringify(expectedFiles) !== JSON.stringify(actualFiles)) {
    const expected = new Set(expectedFiles);
    const actual = new Set(actualFiles);
    for (const file of expectedFiles.filter((file) => !actual.has(file))) {
      differences.push(`missing ${file}`);
    }
    for (const file of actualFiles.filter((file) => !expected.has(file))) {
      differences.push(`unexpected ${file}`);
    }
  }

  for (const file of expectedFiles.filter((file) => actualFiles.includes(file))) {
    const [expected, actual] = await Promise.all([
      readFile(path.join(expectedRoot, file)),
      readFile(path.join(actualRoot, file)),
    ]);
    if (!expected.equals(actual)) differences.push(`changed ${file}`);
  }

  return differences;
}

if (!await exists(canonicalRoot)) {
  console.error(`Canonical skill directory does not exist: ${canonicalRoot}`);
  process.exitCode = 1;
} else if (checkOnly) {
  let failed = false;
  for (const mirrorRoot of mirrorRoots) {
    const differences = await compareTrees(canonicalRoot, mirrorRoot);
    if (differences.length > 0) {
      failed = true;
      console.error(`${path.relative(repositoryRoot, mirrorRoot)} is out of sync:`);
      differences.forEach((difference) => console.error(`  - ${difference}`));
    } else {
      console.log(`${path.relative(repositoryRoot, mirrorRoot)} is in sync.`);
    }
  }
  if (failed) process.exitCode = 1;
} else {
  for (const mirrorRoot of mirrorRoots) {
    await rm(mirrorRoot, { recursive: true, force: true });
    await mkdir(path.dirname(mirrorRoot), { recursive: true });
    await cp(canonicalRoot, mirrorRoot, {
      recursive: true,
      filter: (source) => !isSkillEvals(canonicalRoot, source),
    });
    console.log(`Synced skills -> ${path.relative(repositoryRoot, mirrorRoot)}`);
  }
}
