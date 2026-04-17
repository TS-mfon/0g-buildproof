import { Queue } from "bullmq";
import { redisConnection } from "./connection.js";
import { PROJECT_ANALYSIS_QUEUE, type ProjectAnalysisJob } from "./jobs.js";

export const analysisQueue = new Queue<ProjectAnalysisJob>(PROJECT_ANALYSIS_QUEUE, {
  connection: redisConnection
});

export async function enqueueAnalysis(job: ProjectAnalysisJob): Promise<void> {
  await analysisQueue.add("analyze-project", job, {
    attempts: 2,
    backoff: { type: "exponential", delay: 3000 },
    removeOnComplete: 100,
    removeOnFail: 100
  });
}
