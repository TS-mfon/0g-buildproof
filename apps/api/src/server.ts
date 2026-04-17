import cors from "@fastify/cors";
import sensible from "@fastify/sensible";
import Fastify from "fastify";
import { env } from "./env.js";
import { healthRoutes } from "./routes/health.js";
import { projectRoutes } from "./routes/projects.js";
import { storageRoutes } from "./routes/storage.js";

const app = Fastify({ logger: true });

await app.register(cors, {
  origin: env.CORS_ORIGIN === "*" ? true : env.CORS_ORIGIN
});
await app.register(sensible);
await app.register(healthRoutes);
await app.register(projectRoutes);
await app.register(storageRoutes);

app.setErrorHandler((error, _request, reply) => {
  app.log.error(error);
  const detail = error instanceof Error ? error.message : String(error);
  reply.code(500).send({ error: "Internal server error", detail });
});

await app.listen({ port: env.PORT, host: "0.0.0.0" });
