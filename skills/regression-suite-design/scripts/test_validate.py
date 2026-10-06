"""Synthetic checker tests only; not an evaluation of agent output quality."""
import json
from pathlib import Path
import subprocess
import sys
import tempfile
import unittest

CHECKER = Path(__file__).with_name('validate.py')


class CheckerTests(unittest.TestCase):
    def run_check(self, suite_change=lambda x: x, mapping_change=lambda x: x,
                  jira_change=lambda x: x):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            source = root / 'sources'
            output = root / 'output'
            source.mkdir()
            output.mkdir()
            (source / 'draft.feature').write_text(
                'Feature: Draft\nScenario: 01 Save draft\nGiven a draft exists\n'
                'When user saves the draft\nThen the draft is saved\n')
            suite = ('@regression @draft\nFeature: Draft regression\n\n'
                     '  Scenario: [D-01] Save draft, existing draft\n'
                     '    Given a draft exists\n    When user saves the draft\n'
                     '    Then the draft is saved\n    Then the saved draft has a reference\n')
            mapping = ('| Feature | Story | Source scenario | Source | Covered | Regression case IDs | Rationale |\n'
                       '|---|---|---|---|---|---|---|\n'
                       '| Draft | — | 01 Save draft | draft.feature | Covered | D-01 | Save persists draft |\n\n'
                       '| Status | Count |\n|---|---|\n| Covered | 1 |\n')
            jira = ('| Type | Regression Case ID | Regression Case | Covered Functions |\n'
                    '|---|---|---|---|\n'
                    '| Main E2E journey | D-01 | Save draft, existing draft | Draft saved; reference shown |\n')
            for name, text in [('suite.feature', suite_change(suite)),
                               ('mapping.md', mapping_change(mapping)),
                               ('jira.md', jira_change(jira))]:
                (output / name).write_text(text)
            result = subprocess.run([sys.executable, str(CHECKER), '--sources', str(source),
                                     '--suite', str(output / 'suite.feature'), '--mapping', str(output / 'mapping.md'),
                                     '--jira', str(output / 'jira.md'), '--module', 'draft'],
                                    capture_output=True, text=True)
            return result.returncode, json.loads(result.stdout)

    def test_new_step_requires_review_not_failure(self):
        code, result = self.run_check()
        self.assertEqual(code, 0)
        self.assertEqual(result['semantic_review'], 'REQUIRED')
        self.assertEqual(result['step_occurrences']['new'], 1)

    def test_jira_title_mismatch(self):
        code, result = self.run_check(jira_change=lambda s: s.replace('Save draft, existing draft', 'Wrong title'))
        self.assertNotEqual(code, 0)
        self.assertTrue(any('title' in e['message'] for e in result['errors']))

    def test_orphan_mapping_reference_and_bad_summary(self):
        code, result = self.run_check(mapping_change=lambda s: s.replace('| D-01 |', '| UNKNOWN |').replace('| Covered | 1 |', '| Covered | 9 |'))
        self.assertNotEqual(code, 0)
        self.assertTrue(any('reference' in e['message'] for e in result['errors']))
        self.assertTrue(any('summary' in e['message'] for e in result['errors']))

    def test_scenario_tags_comments_and_spacing_are_allowed(self):
        code, result = self.run_check(suite_change=lambda s: s.replace(
            'Feature: Draft regression', '# A permitted comment\nFeature: Draft regression').replace(
            '  Scenario:', '@journey\nScenario:').replace(
            '    Then the draft is saved', '# A permitted comment\nThen the draft is saved'))
        self.assertEqual(code, 0)
        self.assertFalse(result['errors'])

    def test_rule_and_and_are_rejected(self):
        code, result = self.run_check(suite_change=lambda s: s.replace(
            '    Then the draft is saved', '    And the draft is saved'))
        self.assertNotEqual(code, 0)
        self.assertTrue(all(e['line'] > 0 for e in result['errors']))

    def test_outline_examples_expand(self):
        def outline(s):
            return s.replace('  Scenario:', '  Scenario Outline:').replace(
                '    Then the draft is saved', '    Then the draft name is "<name>"') + (
                '\n    Examples:\n      | name |\n      | A |\n      | B |\n')
        code, result = self.run_check(suite_change=outline)
        self.assertEqual(code, 0)
        self.assertEqual(result['executions'], 2)

    def test_missing_outline_column(self):
        def outline(s):
            return s.replace('  Scenario:', '  Scenario Outline:').replace(
                '    Then the draft is saved', '    Then the draft name is "<name>"') + (
                '\n    Examples:\n      | other |\n      | A |\n')
        code, result = self.run_check(suite_change=outline)
        self.assertNotEqual(code, 0)
        self.assertTrue(any('Missing Examples' in e['message'] for e in result['errors']))

    def test_missing_source_row(self):
        code, result = self.run_check(mapping_change=lambda s: s.replace('01 Save draft', '02 Unknown'))
        self.assertNotEqual(code, 0)
        self.assertTrue(any('exactly once' in e['message'] for e in result['errors']))


if __name__ == '__main__':
    unittest.main()
