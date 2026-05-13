import type { BuildProofReport, ProjectSubmission } from "@buildproof/shared";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { env } from "./env.js";

type ProjectRecord = ProjectSubmission & {
  id: string;
  status: "submitted" | "analyzing" | "complete" | "failed";
  createdAt: string;
  updatedAt: string;
};

type JobRecord = {
  id: string;
  projectId: string;
  status: "queued" | "running" | "complete" | "failed";
  currentStep: string;
  error?: string;
  createdAt: string;
  updatedAt: string;
};

const projects = new Map<string, ProjectRecord>();
const jobs = new Map<string, JobRecord>();
const reports = new Map<string, BuildProofReport>();
const dataFile = join(env.DATA_DIR, "buildproof-state.json");

type PersistedState = {
  projects: ProjectRecord[];
  jobs: JobRecord[];
  reports: Array<[string, BuildProofReport]>;
};

loadState();

export function createProject(submission: ProjectSubmission): ProjectRecord {
  const now = new Date().toISOString();
  const id = crypto.randomUUID();
  const record: ProjectRecord = { ...submission, id, status: "submitted", createdAt: now, updatedAt: now };
  projects.set(id, record);
  persistState();
  return record;
}

export function listProjects(): ProjectRecord[] {
  return [...projects.values()].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function getProject(id: string): ProjectRecord | undefined {
  return projects.get(id);
}

export function updateProjectStatus(id: string, status: ProjectRecord["status"]): void {
  const project = projects.get(id);
  if (!project) return;
  projects.set(id, { ...project, status, updatedAt: new Date().toISOString() });
  persistState();
}

export function createJob(projectId: string): JobRecord {
  const now = new Date().toISOString();
  const job: JobRecord = {
    id: crypto.randomUUID(),
    projectId,
    status: "queued",
    currentStep: "queued",
    createdAt: now,
    updatedAt: now
  };
  jobs.set(job.id, job);
  persistState();
  return job;
}

export function updateJob(id: string, patch: Partial<JobRecord>): JobRecord | undefined {
  const job = jobs.get(id);
  if (!job) return undefined;
  const updated = { ...job, ...patch, updatedAt: new Date().toISOString() };
  jobs.set(id, updated);
  persistState();
  return updated;
}

export function getJob(id: string): JobRecord | undefined {
  return jobs.get(id);
}

export function saveReport(projectId: string, report: BuildProofReport): void {
  reports.set(projectId, report);
  persistState();
}

export function getReport(projectId: string): BuildProofReport | undefined {
  return reports.get(projectId);
}

function loadState(): void {
  try {
    if (!existsSync(dataFile)) return;
    const parsed = JSON.parse(readFileSync(dataFile, "utf8")) as PersistedState;
    parsed.projects?.forEach((project) => projects.set(project.id, project));
    parsed.jobs?.forEach((job) => jobs.set(job.id, job));
    parsed.reports?.forEach(([projectId, report]) => reports.set(projectId, report));
  } catch (error) {
    console.warn("BuildProof state restore failed", error);
  }
}

function persistState(): void {
  try {
    mkdirSync(env.DATA_DIR, { recursive: true });
    const state: PersistedState = {
      projects: [...projects.values()],
      jobs: [...jobs.values()],
      reports: [...reports.entries()]
    };
    writeFileSync(dataFile, JSON.stringify(state, null, 2));
  } catch (error) {
    console.warn("BuildProof state persist failed", error);
  }
}
