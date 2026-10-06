#!/bin/sh
set -eu
WIKI_ROOT=$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)
. "$WIKI_ROOT/tools/common.sh"
if [ ! -f "$OPENVIKING_CODEX_AUTH_PATH" ]; then
  echo 'No local Codex OAuth store. See wiki/README.md.' >&2
  exit 1
fi
exec "$WIKI_ROOT/.venv/bin/openviking-server" --config "$OPENVIKING_CONFIG_FILE" --host 127.0.0.1 --port 19330 --with-bot --bot-port 19331
