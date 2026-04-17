import { Queue } from "bullmq";
import { Redis } from "ioredis";
import { env } from "../env.js";
import { PROJECT_ANALYSIS_QUEUE, type ProjectAnalysisJob } from "./jobs.js";

export async function enqueueAnalysis(job: ProjectAnalysisJob): Promise<void> {
  if (!env.REDIS_URL) {
    throw new Error("REDIS_URL is not configured");
  }
  const connection = new Redis(env.REDIS_URL, { maxRetriesPerRequest: null, lazyConnect: true });
  const analysisQueue = new Queue<ProjectAnalysisJob>(PROJECT_ANALYSIS_QUEUE, { connection });
  await analysisQueue.add("analyze-project", job, {
    attempts: 2,
    backoff: { type: "exponential", delay: 3000 },
    removeOnComplete: 100,
    removeOnFail: 100
  });
  await analysisQueue.close();
  await connection.quit();
}
