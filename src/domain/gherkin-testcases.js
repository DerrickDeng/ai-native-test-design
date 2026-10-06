/**
 * Parse the functional subset of Gherkin used by the repository into a small,
 * adapter-neutral model. Structural policy is enforced by feature-lint; this
 * parser only performs deterministic conversion for approved artifacts.
 *
 * @param {string} content
 * @returns {{feature: {name: string, tags: string[]}, scenarios: Array}}
 */
function parseFunctionalFeature(content) {
  const lines = content.split(/\r?\n/);
  const feature = { name: '', tags: [] };
  const scenarios = [];

  let currentScenario = null;
  let inExamples = false;
  let pendingTags = [];

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) continue;

    if (line.startsWith('@')) {
      pendingTags = pendingTags.concat(line.split(/\s+/).filter(tag => tag.startsWith('@')));
      continue;
    }

    const featureMatch = line.match(/^Feature\s*:\s*(.*)$/);
    if (featureMatch) {
      feature.name = featureMatch[1].trim();
      feature.tags = pendingTags;
      pendingTags = [];
      continue;
    }

    if (line.startsWith('Background:')) {
      pendingTags = [];
      continue;
    }

    const scenarioMatch = line.match(/^(Scenario Outline|Scenario Template|Scenario|Example)\s*:\s*(.*)$/);
    if (scenarioMatch) {
      inExamples = false;
      currentScenario = {
        keyword: scenarioMatch[1],
        name: scenarioMatch[2].trim(),
        tags: pendingTags,
        steps: [],
        examples: []
      };
      scenarios.push(currentScenario);
      pendingTags = [];
      continue;
    }

    if (line.startsWith('Examples:')) {
      inExamples = true;
      if (currentScenario) currentScenario.examples.push(line);
      continue;
    }

    if (line.startsWith('|')) {
      if (currentScenario && inExamples) currentScenario.examples.push(line);
      continue;
    }

    const stepMatch = line.match(/^(Given|When|Then|And|But)\b\s*(.*)$/);
    if (stepMatch) {
      inExamples = false;
      if (currentScenario) {
        currentScenario.steps.push({ keyword: `${stepMatch[1]} `, text: stepMatch[2].trim() });
      }
    }
  }

  return { feature, scenarios };
}

/**
 * Format one parsed scenario as an adapter-neutral manual test description.
 *
 * @param {{name: string, tags: string[]}} feature
 * @param {{keyword: string, name: string, tags: string[], steps: Array, examples: string[]}} scenario
 * @returns {string}
 */
function formatManualTestDescription(feature, scenario) {
  let description = `Feature: ${feature.name}\n\n`;
  if (feature.tags.length > 0) description += `Tags: ${feature.tags.join(', ')}\n\n`;
  description += `${scenario.keyword}: ${scenario.name}\n\n`;
  if (scenario.tags.length > 0) description += `Tags: ${scenario.tags.join(', ')}\n\n`;
  description += 'Steps:\n';

  for (const step of scenario.steps) {
    description += `- ${step.keyword}${step.text}\n`;
  }

  if (['Scenario Outline', 'Scenario Template'].includes(scenario.keyword) && scenario.examples.length > 0) {
    description += `\n${scenario.examples.join('\n')}\n`;
  }

  return description;
}

module.exports = { parseFunctionalFeature, formatManualTestDescription };
