import type { BuildProofReport, ProjectSubmission } from "@buildproof/shared";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000";

export async function listProjects(): Promise<Array<ProjectSubmission & { id: string; status: string }>> {
  const response = await fetch(`${API_BASE_URL}/projects`, { cache: "no-store" });
  if (!response.ok) return [];
  const json = await response.json() as { projects: Array<ProjectSubmission & { id: string; status: string }> };
  return json.projects;
}

export async function getProject(projectId: string): Promise<{ project?: ProjectSubmission & { id: string; status: string }; report?: BuildProofReport }> {
  const response = await fetch(`${API_BASE_URL}/projects/${projectId}`, { cache: "no-store" });
  if (!response.ok) return {};
  return response.json();
}

export async function submitProject(submission: ProjectSubmission): Promise<{ project: ProjectSubmission & { id: string } }> {
  const response = await fetch(`${API_BASE_URL}/projects`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(submission)
  });
  if (!response.ok) throw new Error(await response.text());
  return response.json();
}

export async function startAnalysis(projectId: string): Promise<{ job: { id: string } }> {
  const response = await fetch(`${API_BASE_URL}/projects/${projectId}/analyze`, { method: "POST" });
  if (!response.ok) throw new Error(await response.text());
  return response.json();
}
