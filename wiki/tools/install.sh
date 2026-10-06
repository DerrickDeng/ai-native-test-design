#!/bin/sh
set -eu
WIKI_ROOT=$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)
python3.12 -m venv "$WIKI_ROOT/.venv"
if command -v uv >/dev/null 2>&1; then
  uv pip install --python "$WIKI_ROOT/.venv/bin/python" 'openviking[bot,local-embed]==0.4.22'
else
  "$WIKI_ROOT/.venv/bin/python" -m pip install 'openviking[bot,local-embed]==0.4.22'
fi
"$WIKI_ROOT/.venv/bin/python" "$WIKI_ROOT/tools/configure.py"
echo 'Install complete. Import Codex OAuth only if you intend to use online Wiki generation; see wiki/README.md.'
