import { env } from "../env.js";

export type ChainAnchor = {
  registryAddress?: string;
  txHash?: string;
  mode: "0g-chain" | "development-placeholder";
};

export async function anchorReportOn0G(params: {
  network: "0g-mainnet" | "0g-testnet";
  reportHash: string;
  storageRoot: string;
}): Promise<ChainAnchor> {
  const registryAddress =
    params.network === "0g-mainnet" ? env.BUILDPROOF_REGISTRY_MAINNET : env.BUILDPROOF_REGISTRY_TESTNET;

  if (!env.PRIVATE_KEY || !registryAddress) {
    return { registryAddress, mode: "development-placeholder" };
  }

  // Production implementation should call BuildProofRegistry.updateReport/registerProject
  // with viem/ethers after contract deployment. The API shape is ready for Render secrets.
  return {
    registryAddress,
    txHash: undefined,
    mode: "0g-chain"
  };
}
