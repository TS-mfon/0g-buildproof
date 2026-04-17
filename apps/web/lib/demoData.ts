import type { BuildProofReport } from "@buildproof/shared";

export const demoReport: BuildProofReport = {
  schemaVersion: "1.0",
  projectId: "demo",
  projectName: "0G BuildProof Demo Passport",
  description: "A sample passport showing how judge-facing proof will look after an analysis run.",
  ownerAddress: "0x0000000000000000000000000000000000000000",
  githubUrl: "https://github.com/example/0g-buildproof",
  demoUrl: "https://www.loom.com/share/demo",
  submittedContract: "0x0000000000000000000000000000000000000000",
  explorerUrl: "https://chainscan.0g.ai",
  targetNetwork: "0g-mainnet",
  claimedModules: ["0G Storage", "0G Compute", "0G Chain"],
  verifiedModules: ["0G Storage", "0G Compute", "0G Chain"],
  scores: { overall: 91, integration: 94, implementation: 88, documentation: 92, demo: 86, community: 94, security: 90 },
  capsApplied: [],
  badges: ["Storage Verified", "Chain Anchored", "Compute Reviewed", "Mainnet Proof", "Judge Ready"],
  criticalIssues: [],
  warnings: ["Replace demo placeholders with final mainnet transaction links before HackQuest submission."],
  recommendedFixes: ["Add final 0G Storage root.", "Add final X post link.", "Record the three-minute demo."],
  judgeSummary: "This passport demonstrates how BuildProof turns repo, demo, storage, compute, and chain evidence into a single judge-ready proof page.",
  ecosystemValue: "The product gives 0G a reusable quality layer for hackathons, grants, and ecosystem discovery.",
  evidence: {
    storageRoot: "0xplaceholderstorage",
    reportHash: "0xplaceholderhash",
    repoDefaultBranch: "main",
    readmeFound: true,
    testsDetected: true,
    contractsDetected: true
  },
  agentFindings: {},
  generatedAt: new Date().toISOString()
};
