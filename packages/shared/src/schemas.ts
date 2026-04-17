import { z } from "zod";
import { CLAIMABLE_MODULES } from "./constants.js";

export const targetNetworkSchema = z.enum(["0g-mainnet", "0g-testnet"]);
export const claimableModuleSchema = z.enum(CLAIMABLE_MODULES);

export const evmAddressSchema = z
  .string()
  .regex(/^0x[a-fA-F0-9]{40}$/, "Expected an EVM address");

export const projectSubmissionSchema = z.object({
  projectName: z.string().min(2).max(80),
  description: z.string().min(10).max(300),
  ownerAddress: evmAddressSchema,
  githubUrl: z.string().url().includes("github.com"),
  readmeUrl: z.string().url().optional().or(z.literal("")),
  demoUrl: z.string().url(),
  submittedContract: evmAddressSchema,
  explorerUrl: z.string().url(),
  targetNetwork: targetNetworkSchema,
  claimedModules: z.array(claimableModuleSchema).min(1)
});

export const scoreSetSchema = z.object({
  overall: z.number().int().min(0).max(100),
  integration: z.number().int().min(0).max(100),
  implementation: z.number().int().min(0).max(100),
  documentation: z.number().int().min(0).max(100),
  demo: z.number().int().min(0).max(100),
  community: z.number().int().min(0).max(100),
  security: z.number().int().min(0).max(100)
});

export const agentFindingSchema = z.object({
  agentName: z.string(),
  score: z.number().int().min(0).max(100),
  summary: z.string(),
  evidence: z.array(z.string()),
  warnings: z.array(z.string()),
  criticalIssues: z.array(z.string()),
  recommendedFixes: z.array(z.string()),
  confidence: z.enum(["low", "medium", "high"])
});

export const buildProofReportSchema = z.object({
  schemaVersion: z.literal("1.0"),
  projectId: z.string(),
  projectName: z.string(),
  description: z.string(),
  ownerAddress: evmAddressSchema,
  githubUrl: z.string().url(),
  demoUrl: z.string().url(),
  submittedContract: evmAddressSchema,
  explorerUrl: z.string().url(),
  targetNetwork: targetNetworkSchema,
  claimedModules: z.array(claimableModuleSchema),
  verifiedModules: z.array(z.string()),
  scores: scoreSetSchema,
  capsApplied: z.array(z.string()),
  badges: z.array(z.string()),
  criticalIssues: z.array(z.string()),
  warnings: z.array(z.string()),
  recommendedFixes: z.array(z.string()),
  judgeSummary: z.string(),
  ecosystemValue: z.string(),
  evidence: z.object({
    storageRoot: z.string(),
    storageTxHash: z.string().optional(),
    registryTxHash: z.string().optional(),
    registryAddress: z.string().optional(),
    reportHash: z.string(),
    repoDefaultBranch: z.string().optional(),
    commitCount: z.number().int().nonnegative().optional(),
    readmeFound: z.boolean(),
    packageManager: z.string().optional(),
    testsDetected: z.boolean(),
    contractsDetected: z.boolean()
  }),
  agentFindings: z.record(agentFindingSchema),
  generatedAt: z.string()
});

export type TargetNetwork = z.infer<typeof targetNetworkSchema>;
export type ProjectSubmission = z.infer<typeof projectSubmissionSchema>;
export type ScoreSet = z.infer<typeof scoreSetSchema>;
export type AgentFinding = z.infer<typeof agentFindingSchema>;
export type BuildProofReport = z.infer<typeof buildProofReportSchema>;
