import assert from "node:assert/strict";
import test from "node:test";
import type { ProjectSubmission } from "@buildproof/shared";
import type { GitHubInspection } from "../services/github.js";
import { detectModuleEvidence } from "./orchestrator.js";

const baseSubmission: ProjectSubmission = {
  projectName: "Passport Check",
  description: "Checks real 0G component evidence.",
  ownerAddress: "0x5905c9Dea6Ae52AA0947D8F7F218263889eDfC4E",
  githubUrl: "https://github.com/example/passport-check",
  demoUrl: "https://example.com/demo",
  submittedContract: "0x1111111111111111111111111111111111111111",
  explorerUrl: "https://chainscan.0g.ai/tx/0x1111111111111111111111111111111111111111111111111111111111111111",
  targetNetwork: "0g-mainnet",
  claimedModules: ["0G Chain", "0G Storage", "0G Compute", "Agent ID", "Privacy"]
};

const baseRepo: GitHubInspection = {
  defaultBranch: "main",
  readmeFound: true,
  testsDetected: true,
  contractsDetected: true,
  packageManager: "npm",
  files: [
    "README.md",
    "src/services/storage0g.ts",
    "src/services/compute0g.ts",
    "src/agent-id/profile.ts",
    "src/privacy/sealed-inference.ts"
  ],
  readmeText: [
    "Uses 0G Storage with a storage root hash.",
    "Uses 0G Compute serving broker for inference.",
    "Registers Agent ID profiles.",
    "TEE sealed inference keeps private scoring encrypted."
  ].join("\n"),
  warnings: []
};

test("detectModuleEvidence verifies claimed 0G modules from submitted proof and repo docs", () => {
  const evidence = detectModuleEvidence(baseSubmission, baseRepo);
  assert.equal(evidence.chain, true);
  assert.equal(evidence.storage, true);
  assert.equal(evidence.compute, true);
  assert.equal(evidence.agentId, true);
  assert.equal(evidence.privacy, true);
  assert.deepEqual(evidence.missing, []);
});

test("detectModuleEvidence rejects weak 0G Chain proof", () => {
  const evidence = detectModuleEvidence(
    {
      ...baseSubmission,
      explorerUrl: "https://etherscan.io/tx/0x1111111111111111111111111111111111111111111111111111111111111111"
    },
    baseRepo
  );
  assert.equal(evidence.chain, false);
  assert.match(evidence.missing.join("\n"), /Claimed 0G Chain/);
});
