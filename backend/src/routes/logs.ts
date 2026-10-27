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
 * Роуты для работы с логами.
 *
 * Сейчас: POST /logs — приём (ingest).
 * Позже: GET /logs — чтение с фильтрами, GET /logs/stream — real-time.
 */
export const logsRoutes: FastifyPluginAsync = async (app) => {
  app.post("/logs", async (req, reply) => {
    // 1) Аутентификация. Ingest — привилегированная операция (запись в БД),
    //    поэтому защищаем её общим ключом из env. Клиент шлёт x-api-key.
    const apiKey = req.headers["x-api-key"];
    if (apiKey !== config.INGEST_API_KEY) {
      return reply.code(401).send({ error: "Invalid or missing API key" });
    }

    // 2) Валидация тела через Zod. safeParse не бросает исключение —
    //    позволяем вернуть понятную 400 с деталями.
    const parsed = IngestBatchSchema.safeParse(req.body);
    if (!parsed.success) {
      return reply.code(400).send({
        error: "Invalid request body",
        details: parsed.error.flatten(),
      });
    }

    // 3) Работа с БД — делегируем в repository.
    const inserted = await logsRepository.insertMany(parsed.data.logs);

    // 4) Ответ. 202 Accepted логичен для приёма пачки событий.
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
    const found = await logsRepository.findMany(parsed.data);
    return reply.code(200).send({ logs: found });
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
