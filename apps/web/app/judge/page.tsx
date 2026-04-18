import Link from "next/link";
import { listProjects } from "../../lib/apiClient";

export default async function JudgeIndexPage() {
  const projects = await listProjects();

  return (
    <section className="band">
      <p className="badge good">Judge Mode</p>
      <h1 className="title">Pick a real passport</h1>
      <p className="muted">Judge Mode is generated from submitted project reports only. No canned demo data is used.</p>
      <div className="grid">
        {projects.map((project) => (
          <Link className="metric list-link" href={`/judge/${project.id}`} key={project.id}>
            <strong>{project.projectName}</strong>
            <span>{project.status} · {project.targetNetwork}</span>
          </Link>
        ))}
      </div>
      {!projects.length && (
        <div className="empty-state">
          <h2>No judge reports yet</h2>
          <p className="muted">Submit a project first, then return here after analysis completes.</p>
          <Link className="button" href="/submit">Submit project</Link>
        </div>
      )}
    </section>
  );
}
