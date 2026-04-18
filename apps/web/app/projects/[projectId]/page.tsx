import { BuildProofPassport } from "../../../components/BuildProofPassport";
import { getProject } from "../../../lib/apiClient";

export default async function ProjectPage({ params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = await params;
  const { report } = await getProject(projectId);
  if (!report) return <section className="band"><h1>Passport pending</h1><p className="muted">The worker has not published this BuildProof report yet.</p></section>;
  return <BuildProofPassport report={report} />;
}
