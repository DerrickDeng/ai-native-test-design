#!/bin/sh
set -eu
WIKI_ROOT=$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)
. "$WIKI_ROOT/tools/common.sh"
exec "$WIKI_ROOT/.venv/bin/ov" "$@"
