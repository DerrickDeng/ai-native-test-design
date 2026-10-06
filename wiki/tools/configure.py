"""Generate a machine-local OpenViking config; never writes credentials to Git."""
import json
from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]
LOCAL=ROOT/".local"
LOCAL.mkdir(parents=True,exist_ok=True)
config={
    "storage":{"workspace":str(ROOT/"data"),"vectordb":{"name":"context","backend":"local"},"agfs":{"backend":"local"}},
    "embedding":{"max_concurrent":1,"max_input_tokens":512,"dense":{"provider":"local","model":"bge-small-zh-v1.5-f16","dimension":512,"cache_dir":str(ROOT/"models")}},
    "vlm":{"provider":"openai-codex","model":"gpt-5.6-terra","reasoning_effort":"medium","timeout":120,"max_concurrent":2},
    "server":{"host":"127.0.0.1","port":19330},
    "bot":{"agents":{"max_tool_iterations":50,"subagent_enabled":False}},
}
(LOCAL/"ov.conf").write_text(json.dumps(config,ensure_ascii=False,indent=2)+"\n")
(LOCAL/"ovcli.conf").write_text(json.dumps({"url":"http://127.0.0.1:19330","timeout":600},indent=2)+"\n")
print("Wrote local OpenViking config; credentials were not printed or changed.")
