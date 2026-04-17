import "dotenv/config";
import { Worker } from "bullmq";
import { Redis } from "ioredis";
import { env } from "./env.js";
import { analyzeProject } from "./processors/analyzeProject.js";

const connection = new Redis(env.REDIS_URL, { maxRetriesPerRequest: null });

const worker = new Worker(
  "project-analysis",
  async (job) => {
    await analyzeProject(job.data.projectId, job.data.jobId);
  },
  { connection }
);

worker.on("completed", (job) => {
  console.log(`Completed BuildProof job ${job.id}`);
});

worker.on("failed", (job, error) => {
  console.error(`Failed BuildProof job ${job?.id}`, error);
});
