import type { BuildProofReport, ProjectSubmission } from "@buildproof/shared";

type Row = ProjectSubmission & { id: string; status: string; report?: BuildProofReport };

export function ProjectLeaderboard({ projects }: { projects: Row[] }) {
  return (
    <section className="band">
      <p className="badge good">Ecosystem signal</p>
      <h1 className="title">Project Leaderboard</h1>
      <p className="muted">Rank, inspect, and route serious 0G builders from one public surface.</p>
      <table className="table">
        <thead>
          <tr>
            <th>Project</th>
            <th>Status</th>
            <th>Network</th>
            <th>Modules</th>
          </tr>
        </thead>
        <tbody>
          {projects.map((project) => (
            <tr key={project.id}>
              <td><a href={`/projects/${project.id}`}>{project.projectName}</a></td>
              <td>{project.status}</td>
              <td>{project.targetNetwork}</td>
              <td>{project.claimedModules.join(", ")}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {!projects.length && <p className="muted">No submitted projects yet. Submit the first BuildProof passport.</p>}
    </section>
  );
}
