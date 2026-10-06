#!/bin/sh
set -eu
WIKI_ROOT=$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)
. "$WIKI_ROOT/tools/common.sh"
"$WIKI_ROOT/.venv/bin/python" - <<'PYCODE'
from openviking.models.vlm.backends.codex_auth import bootstrap_codex_auth
path=bootstrap_codex_auth()
print("Codex OAuth import:", "completed" if path is not None else "no existing Codex login found")
PYCODE
