/**
 * Checker for `requirements/<ISSUE_ID>/coverage.md`.
 *
 * The coverage trace records every claim (atom) found in the requirement, what
 * became of it, and which `Then` step proves it. This module checks the parts a
 * program can check: structure, quotes, and cross-references. Whether the atoms
 * are complete is a semantic review.
 */

const fs = require('fs');
const path = require('path');

const COVERAGE_FILE = 'coverage.md';
const ISSUE_KEY = /[A-Za-z][A-Za-z0-9]*-\d+/g;
const ISSUE_KEY_EXACT = /^[A-Za-z][A-Za-z0-9]*-\d+$/;
const MIN_QUOTE_LENGTH = 4;

const DISPOSITIONS = {
  covered: 'Covered',
  question: 'Question',
  'owned elsewhere': 'Owned elsewhere',
  'not testable': 'Not testable'
};
const RELATIONS = ['shared rule', 'prerequisite', 'interaction', 'no impact'];
const ASSERTION_TYPES = ['stated', 'derived'];

function normalizeText(text) {
  return text.replace(/\\\|/g, '|').replace(/\s+/g, ' ').trim();
}

/** Split a markdown table row on unescaped pipes. */
function splitRow(line) {
  const cells = [];
  let current = '';
  for (let i = 0; i < line.length; i += 1) {
    const ch = line[i];
    if (ch === '\\' && line[i + 1] === '|') {
      current += '\\|';
      i += 1;
    } else if (ch === '|') {
      cells.push(current);
      current = '';
    } else {
      current += ch;
    }
  }
  cells.push(current);
  if (cells.length && cells[0].trim() === '') cells.shift();
  if (cells.length && cells[cells.length - 1].trim() === '') cells.pop();
  return cells.map(cell => cell.trim());
}

const isSeparatorRow = cells => cells.length > 0 && cells.every(cell => /^:?-{3,}:?$/.test(cell));

/**
 * Read the first table under a `## <title>` heading.
 * @returns {{found: boolean, headers: string[], rows: Array<{line: number, cells: string[]}>}}
 */
function readTable(lines, title) {
  const headingIndex = lines.findIndex(line => new RegExp(`^#{1,6}\\s*${title}\\s*$`, 'i').test(line.trim()));
  if (headingIndex < 0) return { found: false, headers: [], rows: [] };

  let index = headingIndex + 1;
  while (index < lines.length && !lines[index].trim().startsWith('|')) {
    if (/^#{1,6}\s/.test(lines[index].trim())) return { found: true, headers: [], rows: [] };
    index += 1;
  }
  if (index >= lines.length) return { found: true, headers: [], rows: [] };

  const headers = splitRow(lines[index]).map(cell => cell.toLowerCase());
  const rows = [];
  for (index += 1; index < lines.length && lines[index].trim().startsWith('|'); index += 1) {
    const cells = splitRow(lines[index]);
    if (isSeparatorRow(cells)) continue;
    rows.push({ line: index + 1, cells });
  }
  return { found: true, headers, rows };
}

function columnIndexes(headers, names) {
  const indexes = {};
  const missing = [];
  names.forEach(name => {
    const at = headers.indexOf(name);
    if (at < 0) missing.push(name);
    indexes[name] = at;
  });
  return { indexes, missing };
}

/** Latest dated formatted snapshot of an issue, or null. */
function findFormattedRequirement(requirementsDir, issueId) {
  const dir = path.join(requirementsDir, issueId);
  let names;
  try {
    names = fs.readdirSync(dir);
  } catch {
    return null;
  }
  const pattern = new RegExp(`^${issueId}-.*-formatted\\.md$`, 'i');
  const matches = names.filter(name => pattern.test(name)).sort();
  return matches.length ? path.join(dir, matches[matches.length - 1]) : null;
}

function readIfExists(file) {
  try {
    return fs.readFileSync(file, 'utf8');
  } catch {
    return null;
  }
}

/** Issue keys named in the requirement's `Related Stories` section. */
function extractRelatedStories(requirementText, issueId) {
  const lines = requirementText.split(/\r?\n/);
  const start = lines.findIndex(line => /^#{1,6}\s*Related Stories\s*$/i.test(line.trim()));
  if (start < 0) return [];
  const keys = new Set();
  for (let i = start + 1; i < lines.length && !/^#{1,6}\s/.test(lines[i].trim()); i += 1) {
    (lines[i].match(ISSUE_KEY) || []).forEach(key => keys.add(key.toUpperCase()));
  }
  keys.delete(issueId.toUpperCase());
  return [...keys];
}

/** `01.2` and `1.2` name the same step. */
function parseThenId(text) {
  const match = text.trim().match(/^(\d+)\.(\d+)$/);
  return match ? `${Number(match[1])}.${Number(match[2])}` : null;
}

/** Ids of every `Then` step in the feature, in `<scenario>.<index>` form. */
function featureThenIds(scenarios) {
  const ids = new Set();
  scenarios.forEach((scenario, scenarioIndex) => {
    let thenIndex = 0;
    scenario.steps.forEach(step => {
      if (step.keyword === 'Then') {
        thenIndex += 1;
        ids.add(`${scenarioIndex + 1}.${thenIndex}`);
      }
    });
  });
  return ids;
}

/**
 * Numbered mentions such as "Scenario 03" or "scenarios 02 and 04" that point past
 * the last scenario in the feature. They usually mean a scenario was removed or
 * renumbered after the text was written. A mention that follows an issue key
 * ("DEMO-204 scenario 02") refers to another Story and is skipped.
 */
function findStaleScenarioReferences(text, scenarioCount) {
  const stale = [];
  const pattern = /\bscenarios?\s+(\d{1,2}(?:\s*(?:,|and|&)\s*\d{1,2})*)(?!\d|\.\d)/gi;
  text.split(/\r?\n/).forEach((line, index) => {
    for (const match of line.matchAll(pattern)) {
      const before = line.slice(Math.max(0, match.index - 40), match.index);
      if (ISSUE_KEY_EXACT.test(before.trim().split(/\s+/).pop() || '') || /[A-Za-z][A-Za-z0-9]*-\d+[^.]{0,30}$/.test(before)) continue;
      match[1].split(/\s*(?:,|and|&)\s*/).map(Number).forEach(number => {
        if (number < 1 || number > scenarioCount) stale.push({ line: index + 1, number });
      });
    }
  });
  return stale;
}

/**
 * Check a coverage trace against its feature, requirement, and note.
 * @param {object} options
 * @param {string} options.issueId
 * @param {string} options.coverageContent - Text of coverage.md
 * @param {Array} options.scenarios - `scenarios` from parseFeature()
 * @param {string} options.requirementsDir - Absolute path of requirements/
 * @returns {{errors: Array, warnings: Array}}
 */
function lintCoverageTrace({ issueId, coverageContent, scenarios, requirementsDir }) {
  const errors = [];
  const warnings = [];
  const err = (line, rule, message) => errors.push({ file: COVERAGE_FILE, line, rule, message });
  const warn = (line, rule, message) => warnings.push({ file: COVERAGE_FILE, line, rule, message });

  const lines = coverageContent.split(/\r?\n/);
  const atomsTable = readTable(lines, 'Atoms');
  const assertionsTable = readTable(lines, 'Assertions');
  const relatedTable = readTable(lines, 'Related Stories');

  const atomColumns = columnIndexes(atomsTable.headers, ['atom', 'source', 'quote', 'disposition', 'ref']);
  const assertionColumns = columnIndexes(assertionsTable.headers, ['then', 'atom', 'type', 'basis']);
  const relatedColumns = columnIndexes(relatedTable.headers, ['story', 'relation', 'handling']);

  if (!atomsTable.found || atomColumns.missing.length) {
    err(1, 'trace-structure', `${COVERAGE_FILE} needs an \`## Atoms\` table with columns Atom, Source, Quote, Disposition, Ref.`);
  }
  if (!assertionsTable.found || assertionColumns.missing.length) {
    err(1, 'trace-structure', `${COVERAGE_FILE} needs an \`## Assertions\` table with columns Then, Atom, Type, Basis.`);
  }
  if (relatedTable.found && relatedColumns.missing.length) {
    err(1, 'trace-structure', `The \`## Related Stories\` table needs columns Story, Relation, Handling.`);
  }
  if (errors.length) return { errors, warnings };

  // Evidence sources
  const requirementFile = findFormattedRequirement(requirementsDir, issueId);
  const requirementText = requirementFile ? readIfExists(requirementFile) : null;
  const noteText = readIfExists(path.join(requirementsDir, issueId, 'note.md'));
  if (requirementText === null) {
    warn(1, 'trace-source-missing', `No formatted requirement found for ${issueId} under requirements/${issueId}/. Quotes were not checked.`);
  }

  const sourceCache = new Map();
  const sourceText = source => {
    const key = source.split(':')[0].trim();
    const cacheKey = key.toLowerCase();
    if (cacheKey === 'note') return noteText;
    if (!ISSUE_KEY_EXACT.test(key) || !source.includes(':')) return requirementText;
    const issue = key.toUpperCase();
    if (issue === issueId.toUpperCase()) return requirementText;
    if (!sourceCache.has(issue)) {
      const file = findFormattedRequirement(requirementsDir, issue);
      sourceCache.set(issue, file ? readIfExists(file) : null);
    }
    return sourceCache.get(issue);
  };

  // Related Stories
  const relatedKeys = new Set();
  relatedTable.rows.forEach(row => {
    const story = (row.cells[relatedColumns.indexes.story] || '').toUpperCase();
    const relation = (row.cells[relatedColumns.indexes.relation] || '').toLowerCase();
    const handling = row.cells[relatedColumns.indexes.handling] || '';
    if (!ISSUE_KEY_EXACT.test(story)) {
      err(row.line, 'related-story-key', `\`${story}\` is not an issue key.`);
      return;
    }
    relatedKeys.add(story);
    if (!RELATIONS.includes(relation)) {
      err(row.line, 'related-story-relation', `Relation \`${relation}\` for ${story} must be one of: Shared rule, Prerequisite, Interaction, No impact.`);
    }
    if (!handling) {
      err(row.line, 'related-story-handling', `Say how ${story} was handled. For \`No impact\`, say why.`);
    }
  });

  if (requirementText !== null) {
    extractRelatedStories(requirementText, issueId).forEach(key => {
      if (!relatedKeys.has(key)) {
        err(1, 'related-story-unaccounted', `The requirement lists ${key} as a related Story but the Related Stories table has no row for it. Read it and classify the relation.`);
      }
    });
  }

  // Atoms
  const atoms = new Map();
  atomsTable.rows.forEach(row => {
    const cell = name => row.cells[atomColumns.indexes[name]] || '';
    const id = cell('atom');
    const source = cell('source');
    const quote = cell('quote');
    const ref = cell('ref');
    const disposition = DISPOSITIONS[cell('disposition').toLowerCase()];

    if (!id) {
      err(row.line, 'atom-id', 'Every atom needs an id.');
      return;
    }
    if (atoms.has(id)) {
      err(row.line, 'atom-duplicate-id', `Atom id \`${id}\` is already used on line ${atoms.get(id).line}.`);
      return;
    }
    atoms.set(id, { line: row.line, disposition, ref });

    if (!disposition) {
      err(row.line, 'atom-disposition', `Atom ${id} needs a disposition: Covered, Question, Owned elsewhere, or Not testable.`);
    }

    if (!quote) {
      err(row.line, 'atom-quote-missing', `Atom ${id} needs an exact quote from its source.`);
    } else if (/^\[image\]/i.test(quote)) {
      if (!source) err(row.line, 'atom-source-missing', `Atom ${id} needs a source.`);
    } else {
      if (!source) {
        err(row.line, 'atom-source-missing', `Atom ${id} needs a source.`);
      } else {
        if (normalizeText(quote).length < MIN_QUOTE_LENGTH) {
          warn(row.line, 'atom-quote-short', `Atom ${id} quote is very short. A short quote matches almost anywhere; quote more of the sentence.`);
        }
        const text = sourceText(source);
        if (text === null) {
          if (requirementText !== null) {
            warn(row.line, 'atom-source-unreadable', `Atom ${id} cites \`${source}\` but no file was found for it. The quote was not checked.`);
          }
        } else if (!normalizeText(text).includes(normalizeText(quote))) {
          err(row.line, 'atom-quote-not-found', `Atom ${id} quote does not appear in \`${source}\`. Copy the exact text.`);
        }
      }
    }

    if (disposition === 'Question') {
      const questionId = ref.match(/\bQ\d+\b/i);
      if (!questionId) {
        err(row.line, 'atom-question-ref', `Atom ${id} is a Question. Put its note.md question id (for example Q1) in Ref.`);
      } else if (noteText === null || !new RegExp(`\\b${questionId[0]}\\b`, 'i').test(noteText)) {
        err(row.line, 'atom-question-unknown', `Atom ${id} points to ${questionId[0]}, which is not in requirements/${issueId}/note.md.`);
      }
    } else if (disposition === 'Owned elsewhere') {
      const owner = ref.toUpperCase();
      if (!ISSUE_KEY_EXACT.test(owner) || owner === issueId.toUpperCase()) {
        err(row.line, 'atom-owner-missing', `Atom ${id} is Owned elsewhere. Put the owning Story's key, not this Story's, in Ref.`);
      } else if (!relatedKeys.has(owner)) {
        warn(row.line, 'atom-owner-not-related', `Atom ${id} names ${owner} as owner but the Related Stories table has no row for it.`);
      }
    } else if (disposition === 'Not testable' && !ref) {
      err(row.line, 'atom-reason-missing', `Atom ${id} is Not testable. Put the reason in Ref.`);
    }
  });

  // Assertions
  const thenIds = featureThenIds(scenarios);
  const tracedThens = new Set();
  const assertedAtoms = new Set();

  assertionsTable.rows.forEach(row => {
    const cell = name => row.cells[assertionColumns.indexes[name]] || '';
    const thenId = parseThenId(cell('then'));
    const atomId = cell('atom');
    const type = cell('type').toLowerCase();
    const basis = cell('basis');

    if (thenId === null) {
      err(row.line, 'then-id', `\`${cell('then')}\` is not a Then id. Use <scenario number>.<index>, for example 01.1.`);
    } else if (!thenIds.has(thenId)) {
      err(row.line, 'then-orphan', `\`${cell('then')}\` does not match any Then step in the feature.`);
    } else {
      tracedThens.add(thenId);
    }

    const atom = atoms.get(atomId);
    if (!atom) {
      err(row.line, 'assertion-unknown-atom', `\`${atomId}\` is not an atom in the Atoms table.`);
    } else {
      assertedAtoms.add(atomId);
      if (atom.disposition && atom.disposition !== 'Covered') {
        err(row.line, 'assertion-blocked-atom', `${atomId} is ${atom.disposition}. Remove the assertion or change the atom's disposition.`);
      }
    }

    if (!ASSERTION_TYPES.includes(type)) {
      err(row.line, 'assertion-type', type === 'inferred'
        ? `Inferred assertions are not allowed. Remove the Then, or record a question in note.md.`
        : `Type \`${cell('type')}\` must be Stated or Derived.`);
    } else if (type === 'derived' && !basis) {
      err(row.line, 'derived-basis-missing', `Derived assertion ${cell('then')} needs its arithmetic or logic in Basis.`);
    }
  });

  thenIds.forEach(id => {
    if (!tracedThens.has(id)) {
      err(1, 'then-untraced', `Then ${id} has no row in the Assertions table. Trace it to a quote, or remove it.`);
    }
  });

  atoms.forEach((atom, id) => {
    if (atom.disposition === 'Covered' && !assertedAtoms.has(id)) {
      err(atom.line, 'atom-uncovered', `Atom ${id} is Covered but no assertion proves it.`);
    }
  });

  // Text written about the scenarios must still match the feature.
  const prose = lines.map(line => (line.trim().startsWith('|') ? '' : line));
  relatedTable.rows.forEach(row => { prose[row.line - 1] = lines[row.line - 1]; });
  findStaleScenarioReferences(prose.join('\n'), scenarios.length).forEach(({ line, number }) => {
    err(line, 'scenario-ref-missing', `The text mentions scenario ${number}, but the feature has ${scenarios.length} scenario(s). Update the text after removing or renumbering a scenario.`);
  });
  if (noteText !== null) {
    findStaleScenarioReferences(noteText, scenarios.length).forEach(({ line, number }) => {
      warnings.push({ file: 'note.md', line, rule: 'scenario-ref-missing', message: `note.md mentions scenario ${number}, but the feature has ${scenarios.length} scenario(s). If it names another Story's scenario, put the issue key before it.` });
    });
  }

  return { errors, warnings };
}

module.exports = {
  COVERAGE_FILE,
  extractRelatedStories,
  findFormattedRequirement,
  lintCoverageTrace
};
