import { z } from "zod";

/**
 * Уровни логирования. Должны совпадать с CHECK-констрейнтом в БД
 * (001_create_logs.ts), иначе Postgres отклонит вставку.
 */
export const LogLevelSchema = z.enum(["ERROR", "WARN", "INFO", "DEBUG"]);

/**
 * Схема одной записи лога, приходящей на ingest.
 *
 * Почему не доверяем фронту/клиенту: любые входящие данные валидируются.
 * timestamp принимаем строкой (ISO-8601). Zod проверит формат и превратит
 * в Date — дальше по коду работаем с Date, а Kysely отдаст его в timestamptz.
 */
export const LogEntrySchema = z.object({
  timestamp: z.coerce.date(),
  level: LogLevelSchema,
  service: z.string().min(1).max(100),
  message: z.string().min(1).max(10_000),
  trace: z.string().min(1).max(200),
});

/**
 * Тело запроса POST /logs.
 * Принимаем МАССИВ логов (батч), а не по одному — это в разы эффективнее:
 * одна сетевая поездка + один INSERT вместо N.
 * Ограничение размера батча защищает сервер от гигантских запросов.
 */
export const IngestBatchSchema = z.object({
  logs: z.array(LogEntrySchema).min(1).max(1000),
});

export const ListLogsQuerySchema = z.object({
  level: LogLevelSchema.optional(),
  service: z.string().optional(),
  since: z.coerce.date().optional(),
  limit: z.coerce.number().int().positive().max(1000).default(100)
})

export const ErrorsOverTimeQuerySchema = z.object({
  hoursBack: z.coerce.number().int().positive().max(168).default(24)
})

export const TopErrorsQuerySchema = z.object({
  limit: z.coerce.number().int().positive().max(50).default(5)
})



export type LogEntryInput = z.infer<typeof LogEntrySchema>;
export type IngestBatchInput = z.infer<typeof IngestBatchSchema>;
export type ListLogsQuery = z.infer<typeof ListLogsQuerySchema>;
export type ErrorsOverTimeQuery = z.infer<typeof ErrorsOverTimeQuerySchema>;
export type TopErrorsQuery = z.infer<typeof TopErrorsQuerySchema>;
