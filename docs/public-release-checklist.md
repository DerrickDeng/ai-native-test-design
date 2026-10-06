# Public Release Checklist

The public repository must be created from a clean snapshot, not by pushing a private working history and deleting sensitive files afterward.

Create the reviewed, allowlisted snapshot with `npm run release:build`. The command prints a temporary directory that contains no `.git` history. Initialize the public Git repository from that directory only.

## Content boundary

- [ ] Only synthetic requirements, screenshots, issue keys, names, URLs, field IDs, and reports remain.
- [ ] No organization name, internal product name, hostname, username, account identifier, repository identifier, or proprietary business rule remains.
- [ ] `auth.json`, `env.txt`, certificates, local configuration, logs, and downloaded attachments are absent.
- [ ] Backup and legacy files have either been distilled into generic references or excluded.
- [ ] Examples are explicitly labelled synthetic.

## History boundary

- [ ] Create a new repository with no shared Git history from the private source.
- [ ] Copy only the reviewed sanitized tree.
- [ ] Inspect the complete new history, not only the final worktree.
- [ ] Add the public remote only after the new history passes the content checks.

## Architecture and documentation

- [ ] `AGENTS.md`, README, CLI help, skills, and implementation describe the same active capabilities.
- [ ] Canonical `skills/` and all generated mirrors pass `npm run skills:check`.
- [ ] External adapters are configurable and example values use reserved/synthetic domains.
- [ ] Remote reads and remote writes are clearly distinguished.
- [ ] Deprecated commands and dead adapters are absent.
- [ ] A license has been selected deliberately by the repository owner.

## Verification

```bash
npm test
npm run skills:check
npm run release:build
node scripts/export-jira-user-story.mjs examples/online-store
node scripts/validate-jira-user-story.mjs examples/online-store
git diff --check
```

Perform a final filename and content scan for private terms before publishing. Treat every match as a review item; do not assume that a placeholder-looking token is safe.
