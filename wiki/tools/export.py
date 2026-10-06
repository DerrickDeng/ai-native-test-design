"""Export Markdown from local OpenViking storage; do not change the knowledge base."""
import argparse
import re
from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]
parser=argparse.ArgumentParser()
parser.add_argument("wiki",choices=["qa-dashboard-wiki"])
args=parser.parse_args()
source=ROOT/"data/viking/default/resources"/args.wiki
if not source.is_dir():parser.error(f"Missing native Wiki: {source}")
target=ROOT/"generated"/args.wiki
count=0
for file in source.rglob("*.md"):
    if file.name in {".abstract.md",".overview.md"}:continue
    relative=file.relative_to(source)
    destination=target/relative
    destination.parent.mkdir(parents=True,exist_ok=True)
    content=file.read_text()
    # Only normalize Markdown link destinations with spaces for rendering.
    content=re.sub(r"\]\(([^)]+)\)",lambda m:"](<"+m[1]+">)" if any(c.isspace() for c in m[1]) else m[0],content)
    destination.write_text(content)
    count+=1
print(f"Exported {count} pages to {target}. Generated content is git-ignored.")
