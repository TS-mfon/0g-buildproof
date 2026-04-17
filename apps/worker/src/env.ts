import "dotenv/config";
import { z } from "zod";

export const env = z.object({
  REDIS_URL: z.string().optional(),
  API_BASE_URL: z.string().url().default("http://localhost:4000")
}).parse(process.env);
