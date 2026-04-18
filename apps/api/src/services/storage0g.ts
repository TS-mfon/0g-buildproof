import { Indexer, MemData } from "@0gfoundation/0g-ts-sdk";
import { Wallet, JsonRpcProvider } from "ethers";
import { setDefaultResultOrder } from "node:dns";
import { env } from "../env.js";
import { canonicalJson } from "./hashing.js";

export type StorageUpload = {
  root: string;
  txHash?: string;
  mode: "0g-storage" | "not-configured" | "failed";
  error?: string;
};

export async function uploadReportTo0G(report: unknown): Promise<StorageUpload> {
  if (!env.PRIVATE_KEY) {
    return { root: "", mode: "not-configured", error: "PRIVATE_KEY is not configured for 0G Storage upload." };
  }

  try {
    setDefaultResultOrder("ipv4first");
    const provider = new JsonRpcProvider(env.OG_MAINNET_RPC_URL);
    const signer = new Wallet(env.PRIVATE_KEY, provider);
    const indexer = new Indexer(env.OG_MAINNET_STORAGE_INDEXER);
    const file = new MemData(Buffer.from(canonicalJson(report), "utf8"));
    const [uploaded, error] = await indexer.upload(file, env.OG_MAINNET_RPC_URL, signer as never);
    if (error) throw error;
    if (!uploaded) throw new Error("0G Storage upload returned no result.");

    if ("rootHash" in uploaded) {
      return { root: uploaded.rootHash, txHash: uploaded.txHash, mode: "0g-storage" };
    }
    return { root: uploaded.rootHashes[0] ?? "", txHash: uploaded.txHashes[0], mode: "0g-storage" };
  } catch (error) {
    return {
      root: "",
      mode: "failed",
      error: errorToMessage(error)
    };
  }
}

function errorToMessage(error: unknown): string {
  if (error instanceof Error && error.message) return error.message;
  if (typeof error === "string" && error) return error;
  try {
    const serialized = JSON.stringify(error);
    if (serialized && serialized !== "{}") return serialized;
  } catch {
    return "Unknown 0G Storage SDK error.";
  }
  return "Unknown 0G Storage SDK error.";
}
