/**
 * Content filtering utilities for Jira content
 */

/**
 * Remove Jira deletion markers from content
 * Jira uses -{text}- format to mark deleted content.
 * This function removes lines that are primarily marked for deletion in Jira.
 *
 * A line is considered marked for deletion if:
 * 1. It contains bullet markers (* or **) followed by content wrapped in hyphens: "* -text-"
 * 2. The non-whitespace/non-bullet content is entirely wrapped in hyphens: "-Content-"
 *
 * @param {string} content - Raw content from Jira
 * @returns {string} Filtered content without deletion markers
 */
function stripJiraDeleteMarkers(content) {
  if (!content) return content;

  return content
    .split('\n')
    .filter(line => {
      const trimmed = line.trim();

      // Skip empty lines and preserve them
      if (!trimmed) return true;

      // Extract the content after any leading bullet markers (* or **)
      // This helps us check if the actual content is wrapped in hyphens
      const bulletMatch = trimmed.match(/^(\*+\s*)(.*)/);
      const actualContent = bulletMatch ? bulletMatch[2].trim() : trimmed;

      // Check if the actual content is entirely wrapped in hyphens (deletion marker)
      // Pattern: "-text-" where text can contain anything except leading/trailing spaces
      // This matches: "-1 - Deceased-", "-User should not...-", "-Bankrupt-", etc.
      if (actualContent.match(/^-.*-$/)) {
        return false; // Filter out this deleted line
      }

      // Keep the line if it's not marked for deletion
      return true;
    })
    .join('\n');
}

module.exports = {
  stripJiraDeleteMarkers
};
