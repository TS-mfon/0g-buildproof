import { SCORE_WEIGHTS } from "./constants.js";
import type { AgentFinding, BuildProofReport, ScoreSet } from "./schemas.js";

type EvidenceFlags = {
  hasValid0GProof: boolean;
  hasStorageUpload: boolean;
  hasComputeReview: boolean;
  hasMeaningfulRepo: boolean;
  hasReadme: boolean;
  hasDemo: boolean;
  setupLooksRunnable: boolean;
  hasSecretLeak: boolean;
  hasChainAnchor: boolean;
};

export function weightedScore(scores: Omit<ScoreSet, "overall">): number {
  const total =
    scores.integration * SCORE_WEIGHTS.integration +
    scores.implementation * SCORE_WEIGHTS.implementation +
    scores.documentation * SCORE_WEIGHTS.documentation +
    scores.demo * SCORE_WEIGHTS.demo +
    scores.community * SCORE_WEIGHTS.community +
    scores.security * SCORE_WEIGHTS.security;
  return Math.round(total / 100);
}

export function deriveScores(findings: Record<string, AgentFinding>): ScoreSet {
  const integration = findings.IntegrationVerifier?.score ?? 0;
  const implementation = findings.RepoAuditor?.score ?? 0;
  const documentation = findings.DocsReviewer?.score ?? 0;
  const demo = findings.DemoReviewer?.score ?? 0;
  const community = findings.CommunityMentor?.score ?? 0;
  const security = findings.SecurityReviewer?.score ?? 0;
  const overall = weightedScore({
    integration,
    implementation,
    documentation,
    demo,
    community,
    security
  });
  return { overall, integration, implementation, documentation, demo, community, security };
}

export function applyScoreCaps(score: number, flags: EvidenceFlags): { score: number; caps: string[] } {
  const caps: Array<{ label: string; max: number; active: boolean }> = [
    { label: "No valid 0G contract or Explorer proof", max: 45, active: !flags.hasValid0GProof },
    { label: "No 0G Storage upload", max: 55, active: !flags.hasStorageUpload },
    { label: "No 0G Compute review", max: 75, active: !flags.hasComputeReview },
    { label: "Empty or placeholder repository", max: 35, active: !flags.hasMeaningfulRepo },
    { label: "Missing README", max: 60, active: !flags.hasReadme },
    { label: "Missing demo", max: 70, active: !flags.hasDemo },
    { label: "Broken setup instructions", max: 80, active: !flags.setupLooksRunnable },
    { label: "Detected secret leak", max: 50, active: flags.hasSecretLeak },
    { label: "No on-chain anchor", max: 65, active: !flags.hasChainAnchor }
  ];
  const applied = caps.filter((cap) => cap.active);
  const cappedScore = applied.reduce((current, cap) => Math.min(current, cap.max), score);
  return { score: cappedScore, caps: applied.map((cap) => cap.label) };
}

export function deriveBadges(report: Pick<BuildProofReport, "scores" | "verifiedModules" | "evidence" | "capsApplied">): string[] {
  const badges = new Set<string>();
  if (report.verifiedModules.includes("0G Storage") && report.evidence.storageRoot) badges.add("Storage Verified");
  if (report.verifiedModules.includes("0G Chain") && report.evidence.registryTxHash) badges.add("Chain Anchored");
  if (report.verifiedModules.includes("0G Compute")) badges.add("Compute Reviewed");
  if (report.evidence.registryAddress && report.evidence.registryTxHash) badges.add("Mainnet Proof");
  if (report.scores.documentation >= 85) badges.add("Docs Excellent");
  if (report.scores.overall >= 85 && report.capsApplied.length === 0) badges.add("Judge Ready");
  if (report.scores.community >= 80) badges.add("Community Useful");
  if (report.scores.overall < 70) badges.add("Needs Work");
  if (report.capsApplied.some((cap) => cap.includes("secret") || cap.includes("placeholder"))) badges.add("High Risk");
  return [...badges];
}
