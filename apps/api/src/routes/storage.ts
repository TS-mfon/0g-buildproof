import type { FastifyInstance } from "fastify";
import { getReport } from "../db.js";

export async function storageRoutes(app: FastifyInstance): Promise<void> {
  app.get("/storage/:projectId", async (request, reply) => {
    const { projectId } = request.params as { projectId: string };
    const report = getReport(projectId);
    if (!report) return reply.code(404).send({ error: "Stored report not found in local cache" });
    return {
      root: report.evidence.storageRoot,
      report
    };
  });
}
