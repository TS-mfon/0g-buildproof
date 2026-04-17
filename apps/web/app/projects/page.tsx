import { ProjectLeaderboard } from "../../components/ProjectLeaderboard";
import { listProjects } from "../../lib/apiClient";

export default async function ProjectsPage() {
  const projects = await listProjects();
  return <ProjectLeaderboard projects={projects} />;
}
