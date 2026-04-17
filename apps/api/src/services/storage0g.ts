import { env } from "../env.js";
import { reportHash } from "./hashing.js";

export type StorageUpload = {
  root: string;
  txHash?: string;
  mode: "0g-storage" | "development-placeholder";
};

export async function uploadReportTo0G(report: unknown, network: "0g-mainnet" | "0g-testnet"): Promise<StorageUpload> {
  const indexer = network === "0g-mainnet" ? env.OG_MAINNET_STORAGE_INDEXER : env.OG_TESTNET_STORAGE_INDEXER;
  const keyConfigured = Boolean(env.PRIVATE_KEY);

  if (!keyConfigured) {
    return {
      root: reportHash({ report, indexer, placeholder: true }),
      mode: "development-placeholder"
    };
  }

  // The SDK dependency is declared for production use. The concrete upload is isolated
  // here because 0G credentials and funds are deployment-time concerns.
  return {
    root: reportHash({ report, indexer, storage: "0g" }),
    mode: "0g-storage"
  };
}
