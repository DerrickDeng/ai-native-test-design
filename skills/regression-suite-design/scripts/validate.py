#!/usr/bin/env python3
"""Read-only checks for the documented Markdown/Gherkin subset; not a BDD runner."""
import argparse
import collections
import json
import re
from pathlib import Path


def cells(line):
    return [c.strip().replace(r'\|', '|') for c in re.split(r'(?<!\\)\|', line.strip())[1:-1]]


def skeleton(text):
    return re.sub(r'<[^>]+>', '<value>', re.sub(r'"[^"\n]*"', '"<value>"', text))


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    for name in ('sources', 'suite', 'mapping', 'jira', 'module'):
        parser.add_argument('--' + name, required=True)
    args = parser.parse_args()
    errors, warnings = [], []

    def error(path, line, message):
        errors.append({'file': str(path), 'line': line, 'message': message})

    def read(path):
        return Path(path).read_text(encoding='utf-8').splitlines()

    suite_path = Path(args.suite).resolve()
    source_root = Path(args.sources).resolve()
    if not source_root.is_dir():
        raise ValueError('--sources must be an existing directory')
    if source_root == suite_path.parent:
        raise ValueError('Place suite outputs in a separate directory from source files')
    if not re.fullmatch(r'[a-z0-9]+(?:-[a-z0-9]+)*', args.module):
        raise ValueError('--module must be lowercase kebab-case')
    source_files = sorted(p for p in source_root.rglob('*.feature')
                          if suite_path.parent not in p.parents)
    source_cases, pool = [], set()
    for path in source_files:
        for num, line in enumerate(read(path), 1):
            match = re.match(r'\s*Scenario(?: Outline)?:\s*(.+)', line)
            if match:
                source_cases.append((path, match[1], num))
            step = re.match(r'\s*(?:Given|When|Then|And|But)\s+(.+)', line)
            if step:
                pool.add(step[1])
    if not source_cases:
        error(source_root, 1, 'No source scenarios found; non-Gherkin input requires manual review')
    source_patterns = {skeleton(s) for s in pool}

    lines = read(suite_path)
    numbered = list(enumerate(lines, 1))
    if suite_path.suffix == '.md':
        starts = [i for i, line in enumerate(lines) if line.strip() == '```gherkin']
        if len(starts) != 1:
            raise ValueError('Markdown suite requires exactly one gherkin block')
        start = starts[0]
        end = next((i for i in range(start + 1, len(lines)) if lines[i].strip() == '```'), None)
        if end is None:
            raise ValueError('Unclosed Gherkin block')
        numbered = numbered[start + 1:end]
    content = [(num, line) for num, line in numbered
               if line.strip() and not line.lstrip().startswith('#')]
    if not content or content[0][1] != '@regression @' + args.module:
        error(suite_path, content[0][0] if content else 1, 'Expected top-level regression and module tags')
    if len(content) < 2 or not content[1][1].startswith('Feature: '):
        error(suite_path, content[0][0] if content else 1, 'Feature must be the first non-comment content after tags')
    header_lines = {num for num, _ in content[:2]}
    cases, current, table = [], None, None
    reuse = collections.Counter(exact=0, parameterized=0, new=0)
    new_steps = collections.defaultdict(list)
    for index, (num, line) in enumerate(numbered):
        if num in header_lines or not line.strip() or line.lstrip().startswith('#'):
            continue
        if line.lstrip().startswith('@'):
            continue
        match = re.fullmatch(r'\s*(Scenario(?: Outline)?): \[([^\]]+)\] (.+)', line)
        if match:
            current = {'id': match[2], 'title': match[3], 'line': num,
                       'outline': match[1].endswith('Outline'), 'steps': [], 'examples': []}
            cases.append(current)
            table = None
            continue
        if current is None:
            error(suite_path, num, 'Expected indented Scenario with [ID]')
            continue
        step = re.fullmatch(r'\s*(Given|When|Then)\s+(.+)', line)
        if step:
            if current['examples']:
                error(suite_path, num, 'Steps must precede Examples')
            current['steps'].append((step[1], step[2], num))
            table = None
            kind = 'exact' if step[2] in pool else 'parameterized' if skeleton(step[2]) in source_patterns else 'new'
            reuse[kind] += 1
            if kind == 'new':
                new_steps[step[2]].append(num)
            continue
        if re.fullmatch(r'\s*Examples:.*', line):
            table = []
            current['examples'].append(table)
            continue
        if re.fullmatch(r'\s*\|.*\|\s*', line):
            if table is None:
                if not current['steps']:
                    error(suite_path, num, 'Data table requires a preceding step')
                # Data tables are attached to the last step for placeholder checks.
                else:
                    key, text, loc = current['steps'][-1]
                    current['steps'][-1] = (key, text + '\n' + line.strip(), loc)
            else:
                table.append((num, cells(line)))
            continue
        error(suite_path, num, 'Unsupported structure; no Rule or And/But')

    executions = 0
    ids = [case['id'] for case in cases]
    for case in cases:
        if ids.count(case['id']) != 1:
            error(suite_path, case['line'], 'Duplicate case ID ' + case['id'])
        if not any(k == 'Then' for k, _, _ in case['steps']):
            error(suite_path, case['line'], 'Scenario has no Then assertion')
        placeholders = set(re.findall(r'<([^>]+)>', '\n'.join(t for _, t, _ in case['steps'])))
        if case['outline'] and not case['examples']:
            error(suite_path, case['line'], 'Outline requires Examples')
        if not case['outline'] and (case['examples'] or placeholders):
            error(suite_path, case['line'], 'Plain Scenario cannot contain Examples or placeholders')
        executions += 0 if case['outline'] else 1
        for rows in case['examples']:
            if len(rows) < 2:
                error(suite_path, case['line'], 'Examples requires a header and data')
                continue
            header = rows[0][1]
            if len(header) != len(set(header)) or any(not c for c in header):
                error(suite_path, rows[0][0], 'Empty or duplicate Examples columns')
            if not placeholders.issubset(header):
                error(suite_path, rows[0][0], 'Missing Examples columns: ' + ', '.join(sorted(placeholders - set(header))))
            for num, row in rows[1:]:
                if len(row) != len(header):
                    error(suite_path, num, 'Examples column count mismatch')
            executions += len(rows) - 1

    def table_rows(path, width, header_test):
        found, rows = False, []
        for num, line in enumerate(read(path), 1):
            if not line.strip().startswith('|'):
                if found and rows:
                    break
                continue
            row = cells(line)
            if header_test(row):
                found = True
                continue
            if not found or all(re.fullmatch(r':?-+:?', c) for c in row):
                continue
            if len(row) != width:
                error(path, num, 'Expected ' + str(width) + ' columns')
            else:
                rows.append((num, row))
        if not found:
            error(path, 1, 'Supported table header not found; custom format requires manual review')
        return rows

    mapping = table_rows(args.mapping, 7, lambda r: len(r) == 7 and r[0] == 'Feature' and r[4] == 'Covered')
    jira = table_rows(args.jira, 4, lambda r: r == ['Type', 'Regression Case ID', 'Regression Case', 'Covered Functions'])
    states = collections.Counter()
    mapped_sources = collections.Counter()
    for num, row in mapping:
        state, refs = row[4], row[5]
        states[state] += 1
        if state not in ('Pending', 'Covered', 'Partial', 'Not covered', 'Needs clarification'):
            error(args.mapping, num, 'Unknown coverage status ' + state)
        if state == 'Pending':
            warnings.append('Pending mapping row at line ' + str(num))
        links = [] if refs in ('', '—', '-') else [x.strip().strip('`') for x in refs.split(',')]
        if state in ('Covered', 'Partial') and not links:
            error(args.mapping, num, 'Coverage requires a case ID')
        for ref in links:
            if ref not in ids:
                error(args.mapping, num, 'Unknown case reference ' + ref)
        if not row[6]:
            error(args.mapping, num, 'Missing rationale')
        locator = row[3].strip('`')
        source_name = row[2].strip('`')
        candidates = []
        for path, title, loc in source_cases:
            if locator not in (path.name, str(path.relative_to(source_root)), str(path)):
                continue
            a, b = re.match(r'^(\d+)\b', source_name), re.match(r'^(\d+)\b', title)
            if source_name == title or (a and b and a[1] == b[1]):
                candidates.append((str(path), loc))
        if len(candidates) != 1:
            error(args.mapping, num, 'Source must identify one scenario by file and exact title or existing numeric prefix')
        else:
            mapped_sources[candidates[0]] += 1
    for path, title, loc in source_cases:
        if mapped_sources[(str(path), loc)] != 1:
            error(path, loc, 'Source scenario must occur exactly once in mapping: ' + title)

    jira_ids = [row[1] for _, row in jira]
    kinds = {}
    allowed_kinds = ('Main E2E journey', 'Targeted high-risk validation')
    for num, row in jira:
        if row[0] not in allowed_kinds:
            error(args.jira, num, 'Unknown case Type')
        kinds[row[1]] = row[0]
        if row[1] not in ids or jira_ids.count(row[1]) != 1:
            error(args.jira, num, 'Unknown or duplicate case ID ' + row[1])
        if not row[3]:
            error(args.jira, num, 'Empty Covered Functions')
    risk_seen = False
    for case in cases:
        matching = [(num, row) for num, row in jira if row[1] == case['id']]
        if len(matching) != 1 or matching[0][1][2] != case['title']:
            error(args.jira, matching[0][0] if matching else 1, 'Missing or mismatched title for ' + case['id'])
        kind = kinds.get(case['id'])
        if kind == allowed_kinds[1]:
            risk_seen = True
        if risk_seen and kind == allowed_kinds[0]:
            error(suite_path, case['line'], 'Main journeys must precede targeted validations')
    if not cases:
        error(suite_path, 1, 'No regression cases found')
    for num, line in enumerate(read(args.mapping), 1):
        row = cells(line) if line.strip().startswith('|') else []
        if len(row) == 2 and row[0] in ('Covered', 'Partial', 'Not covered', 'Needs clarification', 'Pending') and row[1].isdigit():
            if int(row[1]) != states[row[0]]:
                error(args.mapping, num, 'Status summary count mismatch')
        if len(row) == 3 and row[0] in ('Main E2E journeys', 'Targeted high-risk validations', 'Total') and all(c.isdigit() for c in row[1:]):
            selected = cases if row[0] == 'Total' else [c for c in cases if kinds.get(c['id']) == allowed_kinds[0 if row[0] == 'Main E2E journeys' else 1]]
            count = sum(sum(max(0, len(t) - 1) for t in c['examples']) if c['outline'] else 1 for c in selected)
            if list(map(int, row[1:])) != [len(selected), count]:
                error(args.mapping, num, 'Suite summary count mismatch')
    print(json.dumps({'mechanical_checks': 'FAIL' if errors else 'PASS',
                      'semantic_review': 'REQUIRED', 'source_scenarios': len(source_cases),
                      'mapping_rows': len(mapping), 'cases': len(cases), 'jira_rows': len(jira),
                      'executions': executions, 'coverage': dict(states), 'step_occurrences': dict(reuse),
                      'new_steps': [{'text': t, 'suite_lines': locs} for t, locs in new_steps.items()],
                      'warnings': warnings, 'errors': errors}, ensure_ascii=False, indent=2))
    return bool(errors)


if __name__ == '__main__':
    try:
        raise SystemExit(main())
    except (OSError, ValueError) as exc:
        print(json.dumps({'mechanical_checks': 'FAIL', 'error': str(exc)}, ensure_ascii=False))
        raise SystemExit(2)
