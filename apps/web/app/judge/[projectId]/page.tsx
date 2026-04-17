import { JudgeModePanel } from "../../../components/JudgeModePanel";
import { ScoreBreakdown } from "../../../components/ScoreBreakdown";
import { demoReport } from "../../../lib/demoData";
import { getProject } from "../../../lib/apiClient";

export default async function JudgePage({ params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = await params;
  const { report } = projectId === "demo" ? { report: demoReport } : await getProject(projectId);
  if (!report) return <section className="band"><h1>Judge proof pending</h1><p className="muted">No report is available yet.</p></section>;
  return (
    <div className="grid">
      <JudgeModePanel report={report} />
      <ScoreBreakdown scores={report.scores} />
    </div>
  );
}
