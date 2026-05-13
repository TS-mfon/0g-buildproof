import { env } from "../env.js";
import { Contract, Interface, JsonRpcProvider, Wallet } from "ethers";
import type { ScoreSet } from "@buildproof/shared";

export type ChainAnchor = {
  registryAddress?: string;
  txHash?: string;
  passportTokenId?: string;
  mode: "0g-chain" | "not-configured" | "failed";
  error?: string;
};

const registryAbi = [
  "function registerProject(string name,string githubUrl,string demoUrl,address submittedContract,string explorerUrl,string storageRoot,bytes32 reportHash,(uint16 overall,uint16 integration,uint16 implementationScore,uint16 documentation,uint16 demo,uint16 community,uint16 security) scores) external returns (uint256 projectId)",
  "event PassportMinted(uint256 indexed projectId,uint256 indexed tokenId,address indexed owner,string tokenUri)"
];

export async function anchorReportOn0G(params: {
  projectName: string;
  githubUrl: string;
  demoUrl: string;
  submittedContract: string;
  explorerUrl: string;
  reportHash: string;
  storageRoot: string;
  scores: ScoreSet;
}): Promise<ChainAnchor> {
  const registryAddress = env.BUILDPROOF_REGISTRY_MAINNET;

  if (!env.PRIVATE_KEY || !registryAddress) {
    return { registryAddress, mode: "not-configured", error: "PRIVATE_KEY or BUILDPROOF_REGISTRY_MAINNET is not configured." };
  }

  try {
    const provider = new JsonRpcProvider(env.OG_MAINNET_RPC_URL);
    const signer = new Wallet(env.PRIVATE_KEY, provider);
    const contract = new Contract(registryAddress, registryAbi, signer);
    const tx = await contract.registerProject(
      params.projectName,
      params.githubUrl,
      params.demoUrl,
      params.submittedContract,
      params.explorerUrl,
      params.storageRoot,
      params.reportHash,
      [
        params.scores.overall,
        params.scores.integration,
        params.scores.implementation,
        params.scores.documentation,
        params.scores.demo,
        params.scores.community,
        params.scores.security
      ]
    );
    const receipt = await tx.wait();
    return {
      registryAddress,
      txHash: receipt?.hash ?? tx.hash,
      passportTokenId: extractPassportTokenId(receipt?.logs ?? []),
      mode: "0g-chain"
    };
  } catch (error) {
    return {
      registryAddress,
      mode: "failed",
      error: error instanceof Error ? error.message : String(error)
    };
  }
}

function extractPassportTokenId(logs: Array<{ topics: readonly string[]; data: string }>): string | undefined {
  const iface = new Interface(registryAbi);
  for (const log of logs) {
    try {
      const parsed = iface.parseLog({ topics: [...log.topics], data: log.data });
      if (parsed?.name === "PassportMinted") return parsed.args.tokenId.toString();
    } catch {
      // Ignore unrelated logs.
    }
  }
  return undefined;
}
