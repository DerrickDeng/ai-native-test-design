# Source only after WIKI_ROOT has been set by a launcher.
export OPENVIKING_CONFIG_FILE="$WIKI_ROOT/.local/ov.conf"
export OPENVIKING_CLI_CONFIG_FILE="$WIKI_ROOT/.local/ovcli.conf"
export OPENVIKING_CODEX_AUTH_PATH="$WIKI_ROOT/.local/codex_auth.json"
export PATH="$WIKI_ROOT/.venv/bin:$PATH"
export NO_PROXY="127.0.0.1,localhost${NO_PROXY:+,$NO_PROXY}"
