/**
 * Strategy linter for Gherkin .feature files.
 *
 * Enforces the mechanically checkable parts of the Story-level functional-test
 * strategy. Automation-layer placement and AC grounding remain semantic reviews.
 */

const TBC_COMMENT = /^#+\s*TBC\b\s*[:：-]?\s*(.*)$/i;
const ISSUE_KEY_TAG = /^@[A-Za-z][A-Za-z0-9]*-\d+$/;
const SCENARIO_NUMBER_PREFIX = /^(\d{2,})\s+(.+)$/;

// A Then states what to observe. Wording that explains how the value was worked
// out, or what it is not, belongs in coverage.md.
const RATIONALE_MARKER = /[，,]\s*即|而不是|因为|由于|\bi\.e\.|\bbecause\b|\brather than\b|\binstead of\b/i;

const STEP_KEYWORD = /^(Given|When|Then|And|But)\b\s*(.*)$/;
const SCENARIO_START = /^(Scenario Outline|Scenario Template|Scenario|Example)\s*:\s*(.*)$/;

/**
 * Parse a feature file into a lightweight structure.
 * @param {string} content - Raw .feature file content
 */
function parseFeature(content) {
  const lines = content.split(/\r?\n/);
  const feature = { tags: [], name: null, line: null };
  const scenarios = [];
  const backgrounds = [];
  const tierComments = [];
  const tbcComments = [];

  let pendingTbcComments = [];
  let openTbc = null;
  let pendingTags = [];
  let pendingTagLine = null;
  let current = null;
  let inExamples = false;

  lines.forEach((rawLine, index) => {
    const lineNo = index + 1;
    const line = rawLine.trim();

    if (!line) {
      openTbc = null;
      return;
    }

    if (line.startsWith('#')) {
      if (/^#\s*\d*\.?\s*(unit|integration|end-to-end|e2e)\s+tier/i.test(line)) {
        tierComments.push({ line: lineNo, text: line });
        openTbc = null;
        pendingTbcComments = [];
        return;
      }
      const tbcMatch = line.match(TBC_COMMENT);
      if (tbcMatch) {
        // A `# TBC` note attaches to the scenario written under it, so put it
        // directly above that scenario's tag line. One left at the end of a tier
        // (or of the file) stays unattached and is reported at file level.
        openTbc = { line: lineNo, lines: [tbcMatch[1].trim()].filter(Boolean), scenario: null };
        tbcComments.push(openTbc);
        pendingTbcComments.push(openTbc);
        return;
      }
      // A plain `#` line right under a `# TBC` line continues that question —
      // the questions in this repo routinely wrap, and carry `# -` sub-bullets.
      if (openTbc) {
        openTbc.lines.push(line.replace(/^#+\s?/, '').trim());
      }
      return;
    }
    openTbc = null;

    if (line.startsWith('@')) {
      const tags = line.split(/\s+/).filter(t => t.startsWith('@'));
      if (pendingTags.length === 0) pendingTagLine = lineNo;
      pendingTags = pendingTags.concat(tags);
      return;
    }

    const featureMatch = line.match(/^Feature\s*:\s*(.*)$/);
    if (featureMatch) {
      feature.tags = pendingTags;
      feature.tagLine = pendingTagLine;
      feature.name = featureMatch[1].trim();
      feature.line = lineNo;
      pendingTags = [];
      pendingTagLine = null;
      current = null;
      inExamples = false;
      return;
    }

    if (/^Background\s*:/.test(line)) {
      backgrounds.push({ line: lineNo });
      pendingTags = [];
      pendingTagLine = null;
      current = null;
      inExamples = false;
      return;
    }

    const scenarioMatch = line.match(SCENARIO_START);
    if (scenarioMatch) {
      current = {
        keyword: scenarioMatch[1],
        isOutline: /Outline|Template/i.test(scenarioMatch[1]),
        name: scenarioMatch[2].trim(),
        line: lineNo,
        tags: pendingTags,
        tagLine: pendingTagLine,
        steps: [],
        exampleColumns: [],
        hasExamples: false,
        tbcComments: pendingTbcComments
      };
      pendingTbcComments.forEach(entry => { entry.scenario = current.name; });
      openTbc = null;
      pendingTbcComments = [];
      scenarios.push(current);
      pendingTags = [];
      pendingTagLine = null;
      inExamples = false;
      return;
    }

    if (/^Examples\s*:/.test(line)) {
      if (current) {
        current.hasExamples = true;
        current.examplesLine = lineNo;
      }
      inExamples = true;
      return;
    }

    if (line.startsWith('|')) {
      // A data table under a step is part of that step: it carries the test data.
      if (current && !inExamples && current.steps.length > 0) {
        const last = current.steps[current.steps.length - 1];
        (last.table = last.table || []).push(line.replace(/\s+/g, ' '));
      }
      if (current && inExamples && current.exampleColumns.length === 0) {
        current.exampleColumns = line
          .split('|')
          .slice(1, -1)
          .map(c => c.trim())
          .filter(c => c.length > 0);
      }
      return;
    }

    const stepMatch = line.match(STEP_KEYWORD);
    if (stepMatch && current) {
      current.steps.push({
        keyword: stepMatch[1],
        text: stepMatch[2].trim(),
        line: lineNo
      });
      inExamples = false;
    }
  });

  return { feature, scenarios, backgrounds, tierComments, tbcComments };
}

function normalizeStepText(text) {
  return text.toLowerCase().replace(/\s+/g, ' ').trim();
}

/**
 * Comparable signatures of a scenario. `full` covers every step; `action` covers
 * only the `When` and `Then` steps, so two scenarios that differ only in `Given`
 * share it. A data table under a step counts as part of the step.
 * @param {{steps: Array<{keyword: string, text: string}>}} scenario
 */
function scenarioSignatures(scenario) {
  const pick = keywords => scenario.steps
    .filter(step => keywords.includes(step.keyword))
    .map(step => `${step.keyword}:${normalizeStepText(step.text)}${step.table ? `\n${normalizeStepText(step.table.join('\n'))}` : ''}`)
    .join('\n');
  return {
    full: pick(['Given', 'When', 'Then']),
    action: pick(['When', 'Then'])
  };
}

/**
 * Lint a feature file's content against the strategy.
 * @param {string} content - Raw .feature file content
 * @returns {{errors: Array, warnings: Array, scenarios: Array, hasFE: boolean, hasBE: boolean, tbc: Array}}
 */
function lintFeature(content) {
  const { feature, scenarios, backgrounds, tierComments, tbcComments } = parseFeature(content);
  const tbc = [];
  const errors = [];
  const warnings = [];

  const err = (line, rule, message) => errors.push({ line, rule, message });
  const warn = (line, rule, message) => warnings.push({ line, rule, message });

  if (!feature.name) {
    err(1, 'missing-feature', 'No `Feature:` header found in the file.');
  }

  backgrounds.forEach(bg => {
    err(bg.line, 'no-background', 'Do not use `Background`. Keep each scenario self-contained with explicit steps.');
  });

  const featureIssueKey = feature.tags.filter(t => ISSUE_KEY_TAG.test(t));
  if (feature.name && featureIssueKey.length !== 1) {
    err(feature.tagLine || feature.line, 'feature-issue-key', 'The Feature must have exactly one issue-key tag (e.g. `@DEMO-123`).');
  }
  feature.tags
    .filter(tag => !ISSUE_KEY_TAG.test(tag))
    .forEach(tag => err(feature.tagLine || feature.line, 'feature-tag', `Feature tag \`${tag}\` is not allowed. Keep only the parent issue-key tag.`));

  tierComments.forEach(comment => {
    err(comment.line, 'no-tier-comments', 'Do not group Story-level functional scenarios into automation tiers.');
  });

  if (scenarios.length === 0) {
    err(feature.line || 1, 'no-scenarios', 'The feature file contains no scenarios.');
  }

  const seenNames = new Map();
  const seenFull = new Map();
  const seenAction = new Map();

  scenarios.forEach((scenario, index) => {
    const tagLine = scenario.tagLine || scenario.line;
    const expectedNumber = String(index + 1).padStart(2, '0');
    const numberMatch = scenario.name.match(SCENARIO_NUMBER_PREFIX);
    let comparableName = scenario.name;

    if (!numberMatch) {
      err(scenario.line, 'scenario-number-prefix', `Scenario name must start with the sequential zero-padded number \`${expectedNumber}\` (e.g. \`${expectedNumber} Customer submits an order\`).`);
    } else {
      const actualNumber = numberMatch[1];
      comparableName = numberMatch[2].trim();
      if (actualNumber !== expectedNumber) {
        err(scenario.line, 'scenario-number-sequence', `Scenario number must be \`${expectedNumber}\` in file order; found \`${actualNumber}\`.`);
      }
    }

    // Compare the descriptive title without its sequence number so numbering
    // cannot hide duplicate business scenarios.
    if (comparableName) {
      const key = comparableName.toLowerCase();
      if (seenNames.has(key)) {
        err(scenario.line, 'duplicate-scenario-name', `Scenario name duplicates the one on line ${seenNames.get(key)}.`);
      } else {
        seenNames.set(key, scenario.line);
      }
    }

    // Story-level functional scenarios carry no tags. Automation placement is
    // reported separately by the automation-coverage-analysis skill.
    scenario.tags.forEach(tag => {
      err(tagLine, 'scenario-tag', `Scenario tag \`${tag}\` is not allowed in a Story-level functional feature.`);
    });

    // Step keywords
    const thens = scenario.steps.filter(s => s.keyword === 'Then');

    thens.forEach(step => {
      if (RATIONALE_MARKER.test(step.text)) {
        warn(step.line, 'then-rationale', `A \`Then\` step explains how the value is worked out or what it is not. State only what to observe, and put the arithmetic in the coverage trace Basis. Keep a negation only when the requirement itself states it.`);
      }
    });

    scenario.steps.forEach(step => {
      if (step.keyword === 'And' || step.keyword === 'But') {
        err(step.line, 'no-and-but', `\`${step.keyword}\` is banned. Repeat the parent keyword (\`Given\`, \`When\`, or \`Then\`) instead.`);
      }
    });

    if (scenario.steps.length === 0) {
      err(scenario.line, 'empty-scenario', `Scenario "${scenario.name}" has no steps.`);
    } else if (thens.length === 0) {
      err(scenario.line, 'missing-then', `Scenario "${scenario.name}" has no \`Then\` assertion.`);
    } else {
      // Two scenarios that fail for the same reason add cost and no coverage.
      const signatures = scenarioSignatures(scenario);
      if (seenFull.has(signatures.full)) {
        err(scenario.line, 'duplicate-scenario-body', `Scenario "${scenario.name}" has the same steps as the one on line ${seenFull.get(signatures.full)}. Remove it.`);
      } else {
        seenFull.set(signatures.full, scenario.line);
        if (seenAction.has(signatures.action)) {
          warn(scenario.line, 'same-action-and-outcome', `Scenario "${scenario.name}" has the same \`When\` and \`Then\` steps as the one on line ${seenAction.get(signatures.action)} and differs only in \`Given\`. Merge them, use a Scenario Outline, or be able to say which requirement claim makes each fail separately.`);
        } else {
          seenAction.set(signatures.action, scenario.line);
        }
      }
    }

    // Scenario Outline placeholders vs. Examples columns
    const placeholders = new Set();
    scenario.steps.forEach(step => {
      const found = step.text.match(/<([^<>]+)>/g) || [];
      found.forEach(p => placeholders.add(p.slice(1, -1).trim()));
    });

    if (placeholders.size > 0 && !scenario.hasExamples) {
      warn(scenario.line, 'placeholder-without-examples', `Scenario "${scenario.name}" uses placeholders (${[...placeholders].join(', ')}) but has no \`Examples\` table.`);
    }

    if (scenario.hasExamples) {
      scenario.exampleColumns.forEach(column => {
        if (!placeholders.has(column)) {
          warn(scenario.examplesLine, 'unused-example-column', `Examples column \`${column}\` in "${scenario.name}" is never referenced by a step. Every column must be evaluated by the scenario.`);
        }
      });
      placeholders.forEach(placeholder => {
        if (!scenario.exampleColumns.includes(placeholder)) {
          warn(scenario.examplesLine, 'undefined-placeholder', `Placeholder \`<${placeholder}>\` in "${scenario.name}" has no matching Examples column.`);
        }
      });
    }
  });

  // Open questions belong in note.md, never in the executable feature.
  tbcComments.forEach(c => {
    if (c.lines.length === 0) return;
    tbc.push({
      line: c.line,
      scenario: c.scenario,
      questions: c.lines,
      undecidedSide: false
    });
    const where = c.scenario ? `"${c.scenario}"` : 'this feature';
    err(c.line, 'no-inline-tbc', `Move the open requirement question on ${where} to the Story's note.md.`);
  });

  tbc.sort((a, b) => a.line - b.line);

  return { errors, warnings, scenarios, feature, tbc };
}

/**
 * Render lint findings for the terminal.
 * @param {object} result - Output of lintFeature
 * @param {string} filePath - File the findings belong to
 */
function formatLintReport(result, filePath) {
  const lines = [];
  lines.push(`\n[Strategy Lint] ${filePath}`);

  if (result.errors.length === 0 && result.warnings.length === 0) {
    lines.push(`  ✅ No strategy violations found (${result.scenarios.length} scenarios).`);
    return lines.join('\n');
  }

  const errors = result.errors;
  const warnings = result.warnings;
  // Findings from other files (for example coverage.md) name their file.
  const where = f => (f.file ? `${f.file}${f.line ? `:${f.line}` : ''}` : `line ${f.line}`);

  if (errors.length === 0 && warnings.length === 0) {
    lines.push(`  ✅ No strategy violations found (${result.scenarios.length} scenarios).`);
    lines.push(formatTbcReport(result));
    return lines.join('\n');
  }

  if (errors.length > 0) {
    lines.push(`  ❌ ${errors.length} error(s):`);
    errors.forEach(e => lines.push(`     ${where(e)} [${e.rule}] ${e.message}`));
  }

  if (warnings.length > 0) {
    lines.push(`  ⚠️  ${warnings.length} warning(s):`);
    warnings.forEach(w => lines.push(`     ${where(w)} [${w.rule}] ${w.message}`));
  }

  const tbcBlock = formatTbcReport(result);
  if (tbcBlock) lines.push(tbcBlock);

  return lines.join('\n');
}

/**
 * Render the open `@TBC` questions on their own.
 * @param {object} result - lintFeature() result
 * @returns {string} empty string when nothing is unresolved
 */
function formatTbcReport(result) {
  if (!result.tbc || result.tbc.length === 0) return '';

  const lines = [`\n[TBC] ${result.tbc.length} inline open question(s) — move to note.md:`];

  result.tbc.forEach(item => {
    lines.push(`     line ${item.line}  ${item.scenario ? item.scenario : '(file level)'}`);
    item.questions.forEach(q => lines.push(`              ${q}`));
  });

  lines.push(`     Inline questions fail the strategy lint until they are moved.`);
  return lines.join('\n');
}

module.exports = {
  parseFeature,
  scenarioSignatures,
  lintFeature,
  formatLintReport,
  formatTbcReport
};
