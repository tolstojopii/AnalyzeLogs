import { db } from "../db";
import type { LogsTable } from "../db/types";
import type { ListLogsQuery, LogEntryInput, StreamwithoutAfter } from "../schemas/logs";
import type { Selectable } from "kysely";
import { sql } from "kysely";

/**
 * Зачем отдельный слой:
 *  - при переезде на ClickHouse меняется только этот файл;
 *  - запросы можно юнит-тестировать отдельно от HTTP.
 */
export const logsRepository = {
  async insertMany(entries: LogEntryInput[]): Promise<number> {
    if (entries.length === 0) return 0;

    const rows = entries.map((e) => ({
      timestamp: e.timestamp,
      level: e.level,
      service: e.service,
      message: e.message,
      trace: e.trace,
    }));

    const result = await db.insertInto("logs").values(rows).executeTakeFirst();

    // numInsertedOrUpdatedRows может быть undefined - приводим к number.
    return Number(result.numInsertedOrUpdatedRows ?? 0);
  },

  async findMany(filters: ListLogsQuery): Promise<Selectable<LogsTable>[]> {
    let query = db
      .selectFrom("logs")
      .selectAll()
      .orderBy("id", "desc")
      .limit(filters.limit + 1);

    if (filters.level) {
      const levels = Array.isArray(filters.level)
        ? filters.level
        : [filters.level];
      if (levels.length > 0) {
        query = query.where("level", "in", levels);
      }
    }
    if (filters.service) {
      query = query.where("service", "=", filters.service);
    }
    if (filters.since) {
      query = query.where("timestamp", ">=", filters.since);
    }
    if (filters.before) {
      query = query.where("id", "<", filters.before);
    }
    if (filters.search) {
      query = query.where("message", "ilike", `%${filters.search}%`);
    }

    return query.execute();
  },

  async countErrorsByHour(
    hoursBack: number,
  ): Promise<{ hour: Date; errors: number }[]> {
    return db
      .selectFrom("logs")
      .select([
        sql<Date>`date_trunc('hour', timestamp)`.as("hour"),
        sql<number>`count(*)`.as("errors"),
      ])
      .where("level", "=", "ERROR")
      .where(
        "timestamp",
        ">=",
        new Date(Date.now() - hoursBack * 60 * 60 * 1000),
      )
      .groupBy(sql`date_trunc('hour', timestamp)`)
      .orderBy("hour")
      .execute();
  },

  

  async topErrors(
    limit: number,
  ): Promise<{ count: number; message: string; service: string }[]> {
    return db
      .selectFrom("logs")
      .select(["message", "service", sql<number>`count(*)`.as("count")])
      .where("level", "=", "ERROR")
      .groupBy("message")
      .groupBy("service")
      .orderBy("count", "desc")
      .limit(limit)
      .execute();
  },

  

  async findAfter(
    filters: StreamwithoutAfter,
    after: number,
    limit = 100,
  ): Promise<Selectable<LogsTable>[]> {
    let query = db
      .selectFrom("logs")
      .selectAll()
      .where("id", ">", after)
      .orderBy("id", "desc")
      .limit(limit)


      if (filters.level) {
      const levels = Array.isArray(filters.level)
        ? filters.level
        : [filters.level];
      if (levels.length > 0) {
        query = query.where("level", "in", levels);
      }
    }
    if(filters.service){
      query = query.where("service", "=", filters.service )
    }
    if(filters.search){
      query = query.where("message", "ilike", `%${filters.search}%`);
    }
      
    return query.execute()
  },

  async countSummary(since?: Date): Promise<{ total: number; errors: number; warns: number }>{
    
    let query = db
    .selectFrom("logs")
    .select([
      sql<number>`count(*)::int `.as("total"),
      sql<number>`count(*) FILTER (WHERE level = 'ERROR')::int`.as("errors"),
      sql<number>`count(*) FILTER (WHERE level = 'WARN')::int`.as("warns"),
    ]);

      if(since){
      query = query.where("timestamp", ">=", since)
    };

    return query.executeTakeFirstOrThrow();
    
  }
  
};
