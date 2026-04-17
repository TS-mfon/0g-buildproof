import { env } from "../env.js";

export async function analyzeProject(projectId: string, jobId: string): Promise<void> {
  const response = await fetch(`${env.API_BASE_URL}/internal/jobs/${jobId}/run`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ projectId })
  });
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`API analysis execution failed: ${response.status} ${text}`);
  }
}
