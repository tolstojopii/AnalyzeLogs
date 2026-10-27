import type { FastifyPluginAsync } from "fastify";
import { config } from "../config";
import { logsRepository } from "../repositories/logs";
import {
  ErrorsOverTimeQuerySchema,
  IngestBatchSchema,
  TopErrorsQuerySchema,
} from "../schemas/logs";
import { ListLogsQuerySchema } from "../schemas/logs";

/**
 * роуты для работы с логами.
 */
export const logsRoutes: FastifyPluginAsync = async (app) => {
  app.post("/logs", async (req, reply) => {
    
    const apiKey = req.headers["x-api-key"];
    if (apiKey !== config.INGEST_API_KEY) {
      return reply.code(401).send({ error: "Invalid or missing API key" });
    }

    // 2) валидация тела через Zod. safeParse не бросает исключение
    const parsed = IngestBatchSchema.safeParse(req.body);
    if (!parsed.success) {
      return reply.code(400).send({
        error: "Invalid request body",
        details: parsed.error.flatten(),
      });
    }

    
    const inserted = await logsRepository.insertMany(parsed.data.logs);

    
    return reply.code(202).send({ accepted: inserted });
  });
  app.get("/logs", async (req, reply) => {
    const parsed = ListLogsQuerySchema.safeParse(req.query);
    if (!parsed.success) {
      return reply.code(400).send({
        error: "Invalid request query",
        details: parsed.error.flatten(),
      });
    }
    const rows = await logsRepository.findMany(parsed.data)
    const hasMore = rows.length > parsed.data.limit
    const logs = hasMore ? rows.slice(0, parsed.data.limit) : rows
    const nextCursor = hasMore ? logs[logs.length - 1].id : null;
    
    return reply.code(200).send({ logs, nextCursor });
  });

  app.get("/logs/stats/over-time", async (req, reply) => {
    const parsed = ErrorsOverTimeQuerySchema.safeParse(req.query);
    if (!parsed.success) {
      return reply.code(400).send({
        error: "Invalid request query",
        details: parsed.error.flatten(),
      });
    }
    const found = await logsRepository.countErrorsByHour(parsed.data.hoursBack);
    return reply.send({ points: found });
  });

  app.get("/logs/stats/top", async (req, reply) => {
    const parsed = TopErrorsQuerySchema.safeParse(req.query);
    if (!parsed.success) {
      return reply.code(400).send({
        error: "Invalid request query",
        details: parsed.error.flatten(),
      });
    }
    const found = await logsRepository.topErrors(parsed.data.limit);
    return reply.send({ top: found });
  });
};
