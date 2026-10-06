import { readdir, readFile } from "node:fs/promises";
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
const errors = [];

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

function parseSource(featureText) {
  const featureTags = [];
  const scenarios = [];
  const steps = [];
  const examples = [];
  const tables = [];
  const comments = [];
  let pendingTags = [];
  let featureSeen = false;
  let currentScenario = null;

  for (const line of featureText.split(/\r?\n/)) {
    const unindentedLine = line.trimStart();

    if (!featureSeen && unindentedLine.startsWith("@")) {
      featureTags.push(unindentedLine);
      continue;
    }

    if (unindentedLine.startsWith("Feature:")) {
      featureSeen = true;
      continue;
    }

    if (unindentedLine.startsWith("@")) {
      pendingTags.push(unindentedLine);
      continue;
    }

    if (/^Scenario(?: Outline)?:/.test(unindentedLine)) {
      currentScenario = {
        title: unindentedLine.replace(/^Scenario Outline:/, "Scenario:"),
        tags: pendingTags,
        lines: [],
      };
      scenarios.push(currentScenario);
      pendingTags = [];
      continue;
    }

    const commentMatch = line.match(/^\s*#+\s*(.*)$/);
    if (commentMatch) {
      comments.push(`!-- [${commentMatch[1]}]`);
      continue;
    }

    if (/^(Given|When|Then)\b/.test(unindentedLine)) {
      steps.push(unindentedLine);
      currentScenario?.lines.push(unindentedLine);
      continue;
    }

    if (unindentedLine === "Examples:") {
      examples.push(unindentedLine);
      currentScenario?.lines.push(unindentedLine);
      continue;
    }

    if (/^\|.*\|$/.test(unindentedLine)) {
      tables.push(unindentedLine);
      currentScenario?.lines.push(unindentedLine);
    }
  }

  return {
    featureTags,
    scenarios,
    steps,
    examples,
    tables,
    comments,
  };
}

function parseExport(exportText, fileName) {
  const scenarios = [];
  const steps = [];
  const examples = [];
  const tables = [];
  const comments = [];
  let pendingTags = [];
  let currentScenario = null;

  for (const [index, line] of exportText.split(/\r?\n/).entries()) {
    const lineNumber = index + 1;

    if (line !== "" && /^\s/.test(line)) {
      errors.push(`${fileName}:${lineNumber} is indented`);
    }

    if (/^(Feature:|Scenario Outline:|#)/.test(line)) {
      errors.push(`${fileName}:${lineNumber} uses an unsupported keyword`);
    }

    if (line.startsWith("@")) {
      if (!/^@\S+(?:\s+@\S+)*$/.test(line)) {
        errors.push(`${fileName}:${lineNumber} has an invalid tag line`);
      }
      pendingTags.push(line);
      continue;
    }

    if (line.startsWith("!--")) {
      if (!/^!-- \[.*\]$/.test(line)) {
        errors.push(`${fileName}:${lineNumber} has an invalid comment`);
      }
      comments.push(line);
      continue;
    }

    if (line.startsWith("Scenario:")) {
      currentScenario = {
        title: line,
        tags: pendingTags,
        lines: [],
      };
      scenarios.push(currentScenario);
      pendingTags = [];
      continue;
    }

    if (/^(Given|When|Then)\b/.test(line)) {
      steps.push(line);
      currentScenario?.lines.push(line);
      continue;
    }

    if (line === "Examples:") {
      examples.push(line);
      currentScenario?.lines.push(line);
      continue;
    }

    if (/^\|.*\|$/.test(line)) {
      tables.push(line);
      currentScenario?.lines.push(line);
      continue;
    }

    if (line !== "") {
      errors.push(`${fileName}:${lineNumber} has an unrecognized line`);
    }
  }

  if (pendingTags.length > 0) {
    errors.push(`${fileName} has tags that are not attached to a Scenario`);
  }

  for (const scenario of scenarios) {
    const placeholders = new Set(
      scenario.lines.join("\n").match(/<[^>]+>/g) ?? [],
    );
    const examplesIndex = scenario.lines.indexOf("Examples:");

    if (examplesIndex >= 0) {
      const exampleRows = scenario.lines
        .slice(examplesIndex + 1)
        .filter((line) => line.startsWith("|"));

      if (exampleRows.length < 2) {
        errors.push(`${fileName} "${scenario.title}" has no Examples data row`);
        continue;
      }

      const headers = new Set(
        exampleRows[0]
          .slice(1, -1)
          .split("|")
          .map((cell) => `<${cell.trim()}>`),
      );

      for (const placeholder of placeholders) {
        if (!headers.has(placeholder)) {
          errors.push(
            `${fileName} "${scenario.title}" is missing Examples header ${placeholder}`,
          );
        }
      }
    } else if (placeholders.size > 0) {
      errors.push(
        `${fileName} "${scenario.title}" has placeholders but no Examples`,
      );
    }
  }

  return {
    scenarios,
    steps,
    examples,
    tables,
    comments,
  };
}

function compareLists(fileName, label, expected, actual) {
  if (JSON.stringify(expected) !== JSON.stringify(actual)) {
    errors.push(`${fileName} does not preserve ${label}`);
  }
}

const sourceFiles = (await collectFiles(sourceDirectory, ".feature"))
  .filter(matchesOnlyFilter)
  .sort();
const exportFiles = (await collectFiles(outputDirectory, ".txt"))
  .filter((fileName) => matchesOnlyFilter(fileName.replace(/\.txt$/, ".feature")))
  .sort();
const expectedExportFiles = sourceFiles.map((fileName) =>
  fileName.replace(/\.feature$/, ".txt"),
);

if (onlyIssueId && sourceFiles.length === 0) {
  console.error(`No feature file named ${onlyIssueId}.feature found under ${sourceDirectory}`);
  process.exit(1);
}

// With --only the export covers a single story, so the whole-tree file list is
// intentionally incomplete and must not be compared.
if (!onlyIssueId) {
  compareLists(
    "jira-user-story",
    "the complete Story file list",
    expectedExportFiles,
    exportFiles,
  );
}

let totalScenarios = 0;

for (const sourceFile of sourceFiles) {
  const exportFile = sourceFile.replace(/\.feature$/, ".txt");
  const sourceText = await readFile(path.join(sourceDirectory, sourceFile), "utf8");
  const exportText = await readFile(path.join(outputDirectory, exportFile), "utf8");
  const source = parseSource(sourceText);
  const exported = parseExport(exportText, exportFile);

  totalScenarios += source.scenarios.length;

  compareLists(
    exportFile,
    "Scenario titles",
    source.scenarios.map((scenario) => scenario.title),
    exported.scenarios.map((scenario) => scenario.title),
  );
  compareLists(exportFile, "steps", source.steps, exported.steps);
  compareLists(exportFile, "Examples blocks", source.examples, exported.examples);
  compareLists(exportFile, "data-table rows", source.tables, exported.tables);
  compareLists(exportFile, "comments", source.comments, exported.comments);

  for (const [index, sourceScenario] of source.scenarios.entries()) {
    compareLists(
      exportFile,
      `body for "${sourceScenario.title}"`,
      sourceScenario.lines,
      exported.scenarios[index]?.lines ?? [],
    );
  }
}

if (errors.length > 0) {
  console.error(`Jira User story validation failed with ${errors.length} error(s):`);
  for (const error of errors) {
    console.error(`- ${error}`);
  }
  process.exitCode = 1;
} else {
  console.log(
    `Validated ${exportFiles.length} Jira User story file(s) and ${totalScenarios} Scenarios with no errors`,
  );
}
