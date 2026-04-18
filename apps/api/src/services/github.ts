import { env } from "../env.js";

export type GitHubInspection = {
  defaultBranch?: string;
  commitCount?: number;
  readmeFound: boolean;
  packageManager?: string;
  testsDetected: boolean;
  contractsDetected: boolean;
  files: string[];
  warnings: string[];
};

export async function inspectGitHubRepo(githubUrl: string): Promise<GitHubInspection> {
  const match = githubUrl.match(/github\.com\/([^/]+)\/([^/#?]+)/);
  if (!match) {
    return emptyInspection(["GitHub URL could not be parsed."]);
  }
  const [, owner, repoWithSuffix] = match;
  const repo = repoWithSuffix.replace(/\.git$/, "");
  const headers: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "User-Agent": "0g-buildproof"
  };
  if (env.GITHUB_TOKEN) headers.Authorization = `Bearer ${env.GITHUB_TOKEN}`;

  try {
    const repoResponse = await fetch(`https://api.github.com/repos/${owner}/${repo}`, { headers });
    if (!repoResponse.ok) return emptyInspection([`GitHub repo lookup failed with ${repoResponse.status}.`]);
    const repoJson = await repoResponse.json() as { default_branch?: string };
    const branch = repoJson.default_branch ?? "main";

    const treeResponse = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/git/trees/${branch}?recursive=1`,
      { headers }
    );
    if (!treeResponse.ok) return emptyInspection([`GitHub tree lookup failed with ${treeResponse.status}.`]);
    const treeJson = await treeResponse.json() as { tree?: Array<{ path: string; type: string }> };
    const files = (treeJson.tree ?? []).filter((item) => item.type === "blob").map((item) => item.path);
    const lower = files.map((file) => file.toLowerCase());

    return {
      defaultBranch: branch,
      commitCount: undefined,
      readmeFound: lower.some((file) => file === "readme.md" || file.startsWith("readme.")),
      packageManager: detectPackageManager(lower),
      testsDetected: lower.some((file) => file.includes("test") || file.includes("spec")),
      contractsDetected: lower.some((file) => file.endsWith(".sol") || file.includes("contracts/")),
      files: files.slice(0, 300),
      warnings: []
    };
  } catch (error) {
    return emptyInspection([error instanceof Error ? error.message : "GitHub inspection failed."]);
  }
}

function detectPackageManager(files: string[]): string | undefined {
  if (files.includes("pnpm-lock.yaml")) return "pnpm";
  if (files.includes("yarn.lock")) return "yarn";
  if (files.includes("package-lock.json")) return "npm";
  if (files.includes("bun.lockb")) return "bun";
  return undefined;
}

function emptyInspection(warnings: string[]): GitHubInspection {
  return {
    readmeFound: false,
    testsDetected: false,
    contractsDetected: false,
    files: [],
    warnings
  };
}
