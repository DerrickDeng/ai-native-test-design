import { mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

// Resolve from the script's own location so the command works from any cwd.
// An optional positional argument overrides the root (used by the tests).
// `--only <ISSUE_ID>` limits the run to a single story's feature file.
const args = process.argv.slice(2);
const onlyFlagIndex = args.indexOf("--only");
const onlyIssueId = onlyFlagIndex >= 0 ? (args[onlyFlagIndex + 1] ?? "").toUpperCase() : null;
const positionalArguments = args.filter(
  (argument, index) => !argument.startsWith("--") && args[index - 1] !== "--only",
);
const repositoryRoot = positionalArguments[0]
  ? path.resolve(positionalArguments[0])
  : path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

function matchesOnlyFilter(featureFile) {
  return onlyIssueId === null
    || path.basename(featureFile, ".feature").toUpperCase() === onlyIssueId;
}
const sourceDirectory = path.join(repositoryRoot, "testcases");
const outputDirectory = path.join(repositoryRoot, "jira-user-story");

async function collectFiles(directory, extension, relativeDirectory = "") {
  const entries = await readdir(path.join(directory, relativeDirectory), {
    withFileTypes: true,
  });
  const files = [];

  for (const entry of entries) {
    const relativePath = path.join(relativeDirectory, entry.name);
    if (entry.isDirectory()) {
      files.push(...await collectFiles(directory, extension, relativePath));
      continue;
    }
    if (entry.isFile() && entry.name.endsWith(extension)) {
      files.push(relativePath);
    }
  }

  return files;
}

function trimEmptyLines(lines) {
  let start = 0;
  let end = lines.length;

  while (start < end && lines[start].trim() === "") {
    start += 1;
  }

  while (end > start && lines[end - 1].trim() === "") {
    end -= 1;
  }

  return lines.slice(start, end);
}

function convertFeatureToJiraUserStory(featureText) {
  const outputLines = [];
  let featureSeen = false;

  for (const line of featureText.split(/\r?\n/)) {
    const unindentedLine = line.trimStart();

    if (unindentedLine.startsWith("@")) {
      continue;
    }

    if (unindentedLine.startsWith("Feature:")) {
      featureSeen = true;
      continue;
    }

    const commentMatch = line.match(/^\s*#+\s*(.*)$/);
    if (commentMatch) {
      outputLines.push(`!-- [${commentMatch[1]}]`);
      continue;
    }

    if (/^Scenario(?: Outline)?:/.test(unindentedLine)) {
      outputLines.push(
        unindentedLine.replace(/^Scenario Outline:/, "Scenario:"),
      );
      continue;
    }

    outputLines.push(unindentedLine);
  }

  return `${trimEmptyLines(outputLines).join("\n")}\n`;
}

await mkdir(outputDirectory, { recursive: true });

const featureFiles = (await collectFiles(sourceDirectory, ".feature"))
  .filter(matchesOnlyFilter)
  .sort();

if (onlyIssueId && featureFiles.length === 0) {
  console.error(`No feature file named ${onlyIssueId}.feature found under ${sourceDirectory}`);
  process.exit(1);
}

for (const featureFile of featureFiles) {
  const sourcePath = path.join(sourceDirectory, featureFile);
  const outputPath = path.join(
    outputDirectory,
    featureFile.replace(/\.feature$/, ".txt"),
  );
  const featureText = await readFile(sourcePath, "utf8");
  const jiraUserStoryText = convertFeatureToJiraUserStory(featureText);

  await mkdir(path.dirname(outputPath), { recursive: true });
  await writeFile(outputPath, jiraUserStoryText, "utf8");
}

console.log(
  `Exported ${featureFiles.length} Jira User story field file(s) to ${outputDirectory}`,
);
