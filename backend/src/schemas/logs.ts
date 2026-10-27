import { z } from "zod";


export const LogLevelSchema = z.enum(["ERROR", "WARN", "INFO", "DEBUG"]);


export const LogEntrySchema = z.object({
  timestamp: z.coerce.date(),
  level: LogLevelSchema,
  service: z.string().min(1).max(100),
  message: z.string().min(1).max(10_000),
  trace: z.string().min(1).max(200),
});

export const IngestBatchSchema = z.object({
  logs: z.array(LogEntrySchema).min(1).max(1000),
});

export const ListLogsQuerySchema = z.object({
  before: z.coerce.number().int().positive().optional(),
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
