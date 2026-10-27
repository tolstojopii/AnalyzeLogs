import Fastify from "fastify";
import cors from "@fastify/cors";
import {sql} from 'kysely'
import { db } from "./db";
import { config } from "./config";
import { logsRoutes } from "./routes/logs";

const app = Fastify({
  logger: {
    level: config.NODE_ENV === "development" ? "info" : "warn",
    transport:
      config.NODE_ENV === "development"
        ? { target: "pino-pretty", options: { colorize: true } }
        : undefined,
  },
});

await app.register(cors, { origin: true });

app.get("/health", async (_req, reply) => {
try{
  await sql`SELECT 1`.execute(db);
  return {status: "ok", db: "up", uptime: process.uptime()};
}catch(err){
  app.log.error({err}, "health check failed");
  return reply.code(503).send({status: 'degraded', db:"down"})
}
});

// Все API-роуты под /api: удобно проксировать с фронта и версионировать.
await app.register(logsRoutes, { prefix: "/api" });

try {
  await app.listen({ port: config.PORT, host: config.HOST });
} catch (err) {
  app.log.error(err);
  process.exit(1);
}

