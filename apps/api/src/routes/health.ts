import type { FastifyInstance } from "fastify";

export async function healthRoutes(app: FastifyInstance): Promise<void> {
  app.get("/health", async () => ({
    ok: true,
    service: "0g-buildproof-api",
    timestamp: new Date().toISOString()
  }));
}
