import { projectSubmissionSchema } from "@buildproof/shared";
import type { FastifyInstance } from "fastify";
import { createJob, createProject, getJob, getProject, getReport, listProjects, updateProjectStatus } from "../db.js";
import { runBuildProofAgents } from "../agents/orchestrator.js";
import { enqueueAnalysis } from "../queue/producer.js";
import { inspectGitHubRepo } from "../services/github.js";
import { saveReport, updateJob } from "../db.js";

export async function projectRoutes(app: FastifyInstance): Promise<void> {
  app.post("/projects", async (request, reply) => {
    const parsed = projectSubmissionSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.code(400).send({ error: "Invalid submission", issues: parsed.error.flatten() });
    }
    const project = createProject(parsed.data);
    return reply.code(201).send({ project });
  });

  app.get("/projects", async () => ({ projects: listProjects() }));

  app.get("/projects/:projectId", async (request, reply) => {
    const { projectId } = request.params as { projectId: string };
    const project = getProject(projectId);
    if (!project) return reply.code(404).send({ error: "Project not found" });
    return { project, report: getReport(projectId) };
  });

  app.post("/projects/:projectId/analyze", async (request, reply) => {
    const { projectId } = request.params as { projectId: string };
    const project = getProject(projectId);
    if (!project) return reply.code(404).send({ error: "Project not found" });
    const job = createJob(projectId);
    updateProjectStatus(projectId, "analyzing");
    try {
      await enqueueAnalysis({ projectId, jobId: job.id });
    } catch (error) {
      const report = await runAnalysis(projectId, job.id);
      return reply.code(202).send({
        job,
        report,
        mode: "synchronous-fallback",
        queueWarning: error instanceof Error ? error.message : String(error)
      });
    }
    return reply.code(202).send({ job });
  });

  app.post("/internal/jobs/:jobId/run", async (request, reply) => {
    const { jobId } = request.params as { jobId: string };
    const job = getJob(jobId);
    if (!job) return reply.code(404).send({ error: "Job not found" });
    try {
      const report = await runAnalysis(job.projectId, job.id);
      return { report };
    } catch (error) {
      updateJob(job.id, {
        status: "failed",
        currentStep: "failed",
        error: error instanceof Error ? error.message : String(error)
      });
      updateProjectStatus(job.projectId, "failed");
      return reply.code(500).send({ error: "Analysis failed", detail: error instanceof Error ? error.message : String(error) });
    }
  });

  app.get("/projects/:projectId/jobs/:jobId", async (request, reply) => {
    const { jobId } = request.params as { projectId: string; jobId: string };
    const job = getJob(jobId);
    if (!job) return reply.code(404).send({ error: "Job not found" });
    return { job };
  });

  app.get("/projects/:projectId/report", async (request, reply) => {
    const { projectId } = request.params as { projectId: string };
    const report = getReport(projectId);
    if (!report) return reply.code(404).send({ error: "Report not found" });
    return { report };
  });

  app.get("/projects/:projectId/judge", async (request, reply) => {
    const { projectId } = request.params as { projectId: string };
    const project = getProject(projectId);
    const report = getReport(projectId);
    if (!project || !report) return reply.code(404).send({ error: "Judge payload not ready" });
    return {
      project,
      report,
      checklist: {
        githubRepo: Boolean(project.githubUrl),
        demo: Boolean(project.demoUrl),
        contractAddress: Boolean(project.submittedContract),
        explorerLink: Boolean(project.explorerUrl),
        storageRoot: Boolean(report.evidence.storageRoot),
        reportHash: Boolean(report.evidence.reportHash),
        registryTx: Boolean(report.evidence.registryTxHash),
        judgeSummary: Boolean(report.judgeSummary)
      }
    };
  });
}

async function runAnalysis(projectId: string, jobId: string) {
  const project = getProject(projectId);
  if (!project) throw new Error(`Project ${projectId} not found`);

  updateJob(jobId, { status: "running", currentStep: "inspect-github" });
  const repo = await inspectGitHubRepo(project.githubUrl);

  updateJob(jobId, { currentStep: "run-agents" });
  const report = await runBuildProofAgents(projectId, project, repo);

  updateJob(jobId, { currentStep: "publish-passport" });
  saveReport(projectId, report);
  updateProjectStatus(projectId, "complete");
  updateJob(jobId, { status: "complete", currentStep: "complete" });
  return report;
}
