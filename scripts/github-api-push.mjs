import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";

const token = process.env.GH_TOKEN;
const owner = process.env.GH_OWNER ?? "TS-mfon";
const repo = process.env.GH_REPO ?? "0g-buildproof";

if (!token) {
  console.error("GH_TOKEN is required");
  process.exit(1);
}

const files = execFileSync("git", ["ls-files"], { encoding: "utf8" })
  .trim()
  .split("\n")
  .filter(Boolean);

async function gh(path, init) {
  const response = await fetch(`https://api.github.com/repos/${owner}/${repo}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github+json",
      "Content-Type": "application/json",
      "X-GitHub-Api-Version": "2022-11-28",
      ...(init?.headers ?? {})
    }
  });
  const text = await response.text();
  const json = text ? JSON.parse(text) : {};
  if (!response.ok) {
    throw new Error(`${init?.method ?? "GET"} ${path} failed: ${response.status} ${JSON.stringify(json)}`);
  }
  return json;
}

const tree = [];
for (const file of files) {
  const content = readFileSync(file, "utf8");
  const blob = await gh("/git/blobs", {
    method: "POST",
    body: JSON.stringify({ content, encoding: "utf-8" })
  });
  tree.push({
    path: file,
    mode: "100644",
    type: "blob",
    sha: blob.sha
  });
}

const createdTree = await gh("/git/trees", {
  method: "POST",
  body: JSON.stringify({ tree })
});

const commit = await gh("/git/commits", {
  method: "POST",
  body: JSON.stringify({
    message: "feat: launch 0g buildproof",
    tree: createdTree.sha,
    parents: []
  })
});

try {
  await gh("/git/refs/heads/main", {
    method: "PATCH",
    body: JSON.stringify({ sha: commit.sha, force: true })
  });
} catch (error) {
  await gh("/git/refs", {
    method: "POST",
    body: JSON.stringify({ ref: "refs/heads/main", sha: commit.sha })
  });
}

console.log(`Pushed ${files.length} files to https://github.com/${owner}/${repo} at ${commit.sha}`);
