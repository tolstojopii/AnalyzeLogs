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
  level: z.union([LogLevelSchema, z.array(LogLevelSchema)]).optional(),
  service: z.string().optional(),
  since: z.coerce.date().optional(),
  limit: z.coerce.number().int().positive().max(1000).default(100),
  search: z.string().max(100).optional()
});

export const ErrorsOverTimeQuerySchema = z.object({
  hoursBack: z.coerce.number().int().positive().max(168).default(24)
})

export const TopErrorsQuerySchema = z.object({
  limit: z.coerce.number().int().positive().max(50).default(5),
  since: z.coerce.date().optional()
})

export const StreamLogsQuerySchema = z.object({
  after: z.coerce.number().int().positive().optional(),
  level: z.union([LogLevelSchema, z.array(LogLevelSchema)]).optional(),
  service: z.string().optional(),
  search: z.string().max(100).optional()
})

export const SummaryQuerySchema = z.object({
  since: z.coerce.date().optional()
})

export const ServicesQuerySchema = z.object({
  since: z.coerce.date().optional()
})

export type StreamwithoutAfter = Omit<StreamLogsQuery, "after">

export type LogEntryInput = z.infer<typeof LogEntrySchema>;
export type IngestBatchInput = z.infer<typeof IngestBatchSchema>;
export type ListLogsQuery = z.infer<typeof ListLogsQuerySchema>;
export type ErrorsOverTimeQuery = z.infer<typeof ErrorsOverTimeQuerySchema>;
export type TopErrorsQuery = z.infer<typeof TopErrorsQuerySchema>;
export type StreamLogsQuery = z.infer<typeof StreamLogsQuerySchema>;
export type SummaryQuery = z.infer<typeof SummaryQuerySchema>
export type ServicesQuery = z.infer<typeof ServicesQuerySchema>