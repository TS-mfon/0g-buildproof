import type { AgentFinding, BuildProofReport, ProjectSubmission } from "@buildproof/shared";
import { applyScoreCaps, deriveBadges, deriveScores } from "@buildproof/shared";
import type { GitHubInspection } from "../services/github.js";
import { reportHash } from "../services/hashing.js";
import { uploadReportTo0G } from "../services/storage0g.js";
import { anchorReportOn0G } from "../services/chain0g.js";
import { runComputePrompt } from "../services/compute0g.js";

export async function runBuildProofAgents(projectId: string, submission: ProjectSubmission, repo: GitHubInspection): Promise<BuildProofReport> {
  const compute = await runComputePrompt(
    "You are a 0G hackathon review agent. Return concise evidence-backed product guidance.",
    `Review ${submission.projectName}. Description: ${submission.description}. Claimed modules: ${submission.claimedModules.join(", ")}. GitHub: ${submission.githubUrl}.`
  );
  const findings: Record<string, AgentFinding> = {
    IntegrationVerifier: integrationFinding(submission),
    RepoAuditor: repoFinding(repo),
    DocsReviewer: docsFinding(repo),
    DemoReviewer: demoFinding(submission),
    SecurityReviewer: securityFinding(repo),
    CommunityMentor: communityFinding(submission, compute.provider === "0g-compute" ? compute.text : undefined)
  };
  const rawScores = deriveScores(findings);
  const hasValid0GProof = submission.explorerUrl.includes("0g") || submission.explorerUrl.includes("chainscan");
  const flags = {
    hasValid0GProof,
    hasStorageUpload: false,
    hasComputeReview: compute.provider === "0g-compute",
    hasMeaningfulRepo: repo.files.length > 10,
    hasReadme: repo.readmeFound,
    hasDemo: Boolean(submission.demoUrl),
    setupLooksRunnable: Boolean(repo.packageManager || repo.contractsDetected),
    hasSecretLeak: repo.files.some((file) => file.includes(".env") && !file.endsWith(".example")),
    hasChainAnchor: false
  };

  const draft: BuildProofReport = {
    schemaVersion: "1.0",
    projectId,
    projectName: submission.projectName,
    description: submission.description,
    ownerAddress: submission.ownerAddress,
    githubUrl: submission.githubUrl,
    demoUrl: submission.demoUrl,
    submittedContract: submission.submittedContract,
    explorerUrl: submission.explorerUrl,
    targetNetwork: submission.targetNetwork,
    claimedModules: submission.claimedModules,
    verifiedModules: flags.hasComputeReview ? ["0G Compute"] : [],
    scores: rawScores,
    capsApplied: [],
    badges: [],
    criticalIssues: Object.values(findings).flatMap((finding) => finding.criticalIssues),
    warnings: [...repo.warnings, ...Object.values(findings).flatMap((finding) => finding.warnings)],
    recommendedFixes: Object.values(findings).flatMap((finding) => finding.recommendedFixes).slice(0, 12),
    judgeSummary: `${submission.projectName} is being reviewed against the current BuildProof evidence bundle.`,
    ecosystemValue: "BuildProof makes real 0G integration, documentation quality, and builder reputation visible to judges and ecosystem contributors.",
    evidence: {
      storageRoot: "",
      reportHash: "",
      repoDefaultBranch: repo.defaultBranch,
      commitCount: repo.commitCount,
      readmeFound: repo.readmeFound,
      packageManager: repo.packageManager,
      testsDetected: repo.testsDetected,
      contractsDetected: repo.contractsDetected
    },
    agentFindings: findings,
    generatedAt: new Date().toISOString()
  };

  if (compute.provider !== "0g-compute") {
    draft.warnings.push("0G Compute endpoint is not configured, so Compute is not marked as verified.");
  }

  const storage = await uploadReportTo0G(draft);
  draft.evidence.storageRoot = storage.root;
  draft.evidence.storageTxHash = storage.txHash;
  flags.hasStorageUpload = storage.mode === "0g-storage" && Boolean(storage.root);
  if (flags.hasStorageUpload) {
    draft.verifiedModules.push("0G Storage");
  } else {
    draft.warnings.push(`0G Storage upload was not verified: ${storage.error ?? storage.mode}`);
  }

  draft.evidence.reportHash = reportHash(draft);
  if (draft.evidence.storageRoot) {
    const chain = await anchorReportOn0G({
      projectName: submission.projectName,
      githubUrl: submission.githubUrl,
      demoUrl: submission.demoUrl,
      submittedContract: submission.submittedContract,
      explorerUrl: submission.explorerUrl,
      reportHash: draft.evidence.reportHash,
      storageRoot: draft.evidence.storageRoot,
      scores: draft.scores
    });
    draft.evidence.registryAddress = chain.registryAddress;
    draft.evidence.registryTxHash = chain.txHash;
    flags.hasChainAnchor = chain.mode === "0g-chain" && Boolean(chain.txHash);
    if (flags.hasChainAnchor) {
      draft.verifiedModules.push("0G Chain");
    } else {
      draft.warnings.push(`0G Chain registry anchor was not verified: ${chain.error ?? chain.mode}`);
    }
  } else {
    draft.warnings.push("0G Chain registry anchor skipped because there is no 0G Storage root to anchor.");
  }

  const capped = applyScoreCaps(rawScores.overall, flags);
  draft.scores = { ...rawScores, overall: capped.score };
  draft.capsApplied = capped.caps;
  draft.judgeSummary = `${submission.projectName} is ${capped.score >= 80 ? "judge-ready" : "promising but needs follow-up"} based on the current BuildProof evidence bundle.`;
  draft.badges = deriveBadges(draft);
  return draft;
}

function integrationFinding(submission: ProjectSubmission): AgentFinding {
  const validExplorer = submission.explorerUrl.includes("0g") || submission.explorerUrl.includes("chainscan");
  return {
    agentName: "IntegrationVerifier",
    score: validExplorer ? 84 : 42,
    summary: validExplorer ? "0G proof fields are present and point to a 0G-style explorer." : "Explorer proof is weak or missing.",
    evidence: [submission.submittedContract, submission.explorerUrl],
    warnings: validExplorer ? [] : ["Explorer URL does not look like a 0G explorer URL."],
    criticalIssues: validExplorer ? [] : ["0G integration cannot be verified from submitted proof."],
    recommendedFixes: validExplorer ? ["Add the final registry transaction after deployment."] : ["Submit a valid 0G Chain Explorer link."],
    confidence: "medium"
  };
}

function repoFinding(repo: GitHubInspection): AgentFinding {
  const score = Math.min(95, 35 + repo.files.length + (repo.testsDetected ? 15 : 0) + (repo.contractsDetected ? 10 : 0));
  return {
    agentName: "RepoAuditor",
    score,
    summary: `Repository inspection found ${repo.files.length} files.`,
    evidence: repo.files.slice(0, 12),
    warnings: repo.files.length <= 10 ? ["Repository appears small or early-stage."] : [],
    criticalIssues: repo.files.length === 0 ? ["Repository files could not be inspected."] : [],
    recommendedFixes: repo.testsDetected ? [] : ["Add tests or a reproducible smoke check."],
    confidence: repo.files.length ? "medium" : "low"
  };
}

function docsFinding(repo: GitHubInspection): AgentFinding {
  return {
    agentName: "DocsReviewer",
    score: repo.readmeFound ? 82 : 35,
    summary: repo.readmeFound ? "README is present." : "README is missing or was not detected.",
    evidence: repo.readmeFound ? ["README detected in repository tree."] : [],
    warnings: repo.readmeFound ? [] : ["Judges need a README with setup and 0G integration notes."],
    criticalIssues: repo.readmeFound ? [] : ["Missing README."],
    recommendedFixes: ["Document 0G modules used, local setup, env vars, and final Explorer links."],
    confidence: "high"
  };
}

function demoFinding(submission: ProjectSubmission): AgentFinding {
  return {
    agentName: "DemoReviewer",
    score: submission.demoUrl ? 78 : 20,
    summary: submission.demoUrl ? "Demo URL is present." : "Demo URL is missing.",
    evidence: submission.demoUrl ? [submission.demoUrl] : [],
    warnings: [],
    criticalIssues: submission.demoUrl ? [] : ["Missing demo video or live demo link."],
    recommendedFixes: ["Keep the final demo under three minutes and show 0G Storage plus 0G Chain proof."],
    confidence: "medium"
  };
}

function securityFinding(repo: GitHubInspection): AgentFinding {
  const leakedEnv = repo.files.some((file) => file.includes(".env") && !file.endsWith(".example"));
  return {
    agentName: "SecurityReviewer",
    score: leakedEnv ? 30 : 88,
    summary: leakedEnv ? "Potential committed env file detected." : "No obvious secret file path detected in the repository tree.",
    evidence: leakedEnv ? repo.files.filter((file) => file.includes(".env")) : ["Repository tree scan"],
    warnings: leakedEnv ? ["Potential secret hygiene issue."] : [],
    criticalIssues: leakedEnv ? ["Possible secret leak path detected."] : [],
    recommendedFixes: leakedEnv ? ["Remove committed env files and rotate exposed secrets."] : ["Keep production secrets only in Render and Vercel env vars."],
    confidence: "medium"
  };
}

function communityFinding(submission: ProjectSubmission, computeText?: string): AgentFinding {
  return {
    agentName: "CommunityMentor",
    score: computeText ? 90 : 78,
    summary: computeText ?? "Project can contribute useful proof and quality signals to the 0G ecosystem.",
    evidence: computeText ? [submission.projectName, "0G Compute review completed", ...submission.claimedModules] : [submission.projectName, ...submission.claimedModules],
    warnings: computeText ? [] : ["0G Compute review is unavailable until OG_COMPUTE_ENDPOINT and OG_COMPUTE_KEY are configured."],
    criticalIssues: [],
    recommendedFixes: [
      "Add good-first-issue labels for community contributors.",
      "Publish a public X thread with screenshots and proof links.",
      "Add a judge walkthrough page with all final submission links."
    ],
    confidence: "medium"
  };
}
