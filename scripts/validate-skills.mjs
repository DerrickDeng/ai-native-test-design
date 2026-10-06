import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const skillsRoot = path.join(repositoryRoot, "skills");
const entries = await readdir(skillsRoot, { withFileTypes: true });
const errors = [];
let count = 0;

for (const entry of entries.filter((item) => item.isDirectory()).sort((a, b) => a.name.localeCompare(b.name))) {
  count += 1;
  const skillPath = path.join(skillsRoot, entry.name, "SKILL.md");
  let content = "";
  try {
    content = await readFile(skillPath, "utf8");
  } catch {
    errors.push(`${entry.name}: missing SKILL.md`);
    continue;
  }

  const frontmatter = content.match(/^---\n([\s\S]*?)\n---\n/);
  if (!frontmatter) {
    errors.push(`${entry.name}: missing YAML frontmatter`);
    continue;
  }
  const name = frontmatter[1].match(/^name:\s*(.+)$/m)?.[1]?.trim();
  const description = frontmatter[1].match(/^description:\s*(.+)$/m)?.[1]?.trim();
  if (name !== entry.name) errors.push(`${entry.name}: frontmatter name must match the folder`);
  if (!description) errors.push(`${entry.name}: description is required`);
  if (/TODO|\[TODO\]|TBD -/i.test(content)) errors.push(`${entry.name}: unfinished placeholder found`);

  const openaiPath = path.join(skillsRoot, entry.name, "agents", "openai.yaml");
  try {
    const openai = await readFile(openaiPath, "utf8");
    if (!openai.includes(`$${entry.name}`)) errors.push(`${entry.name}: default_prompt must reference $${entry.name}`);
  } catch {
    errors.push(`${entry.name}: missing agents/openai.yaml`);
  }
}

if (errors.length > 0) {
  console.error(`Skill validation failed (${errors.length}):`);
  errors.forEach((error) => console.error(`  - ${error}`));
  process.exitCode = 1;
} else {
  console.log(`Validated ${count} canonical skills.`);
}
