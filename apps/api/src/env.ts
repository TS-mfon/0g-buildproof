import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.string().default("development"),
  PORT: z.coerce.number().default(4000),
  CORS_ORIGIN: z.string().default("http://localhost:3000"),
  DATABASE_URL: z.string().optional(),
  REDIS_URL: z.string().optional(),
  GITHUB_TOKEN: z.string().optional(),
  PRIVATE_KEY: z.string().optional(),
  OG_MAINNET_RPC_URL: z.string().url().default("https://evmrpc.0g.ai"),
  OG_MAINNET_EXPLORER: z.string().url().default("https://chainscan.0g.ai"),
  OG_MAINNET_STORAGE_INDEXER: z.string().url().default("https://indexer-storage-turbo.0g.ai"),
  BUILDPROOF_REGISTRY_MAINNET: z.string().optional(),
  OG_COMPUTE_ENDPOINT: z.string().url().optional(),
  OG_COMPUTE_KEY: z.string().optional(),
  OG_COMPUTE_MODEL: z.string().optional()
});

export const env = envSchema.parse(process.env);
export const isProduction = env.NODE_ENV === "production";
