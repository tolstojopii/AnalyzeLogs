import { db } from "../db";
import type { LogsTable } from "../db/types";
import type { ListLogsQuery, LogEntryInput } from "../schemas/logs";
import type { Selectable } from "kysely";
import { sql } from "kysely";

/**
 * Repository — единственное место, где живут SQL-запросы к таблице logs.
 *
 * Зачем отдельный слой:
 *  - роуты не знают про Kysely/SQL;
 *  - при переезде на ClickHouse меняется только этот файл;
 *  - запросы можно юнит-тестировать отдельно от HTTP.
 */
export const logsRepository = {
  /**
   * Пакетная вставка логов одним INSERT.
   *
   * Почему values([...]) и один запрос: Postgres эффективнее принимает
   * многострочный INSERT, чем N отдельных. Возвращаем количество вставленных.
   */
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

    // numInsertedOrUpdatedRows может быть undefined — приводим к number.
    return Number(result.numInsertedOrUpdatedRows ?? 0);
  },

  // Selectable<LogsTable> — это "как строка выглядит при SELECT":
  // id: number, timestamp: Date и т.д. (тип для INSERT отличается — id не передаём).
  async findMany(filters: ListLogsQuery): Promise<Selectable<LogsTable>[]> {
    let query = db
      .selectFrom("logs")
      .selectAll()
      .orderBy("timestamp", "desc")
      .limit(filters.limit);

    if (filters.level) {
      query = query.where("level", "=", filters.level);
    }
    if (filters.service) {
      query = query.where("service", "=", filters.service);
    }
    if (filters.since) {
      query = query.where("timestamp", ">=", filters.since);
    }

    return query.execute();
  },

  async countErrorsByHour(hoursBack: number): Promise<{hour: Date; errors: number}[]>{
    return db.selectFrom("logs")
    .select([
      sql<Date>`date_trunc('hour', timestamp)`.as("hour"),
      sql<number>`count(*)`.as("errors")
    ])
    .where("level", "=", "ERROR")
    .where("timestamp", ">=", new Date(Date.now() - hoursBack * 60 * 60 * 1000))
    .groupBy(sql`date_trunc('hour', timestamp)`)
    .orderBy("hour")
    .execute();
  },

  async topErrors(limit: number): Promise<{count: number; message: string}[]>{
    return db.selectFrom("logs")
    .select([
      'message',
      sql<number>`count(*)`.as('count')
    ])
    .where("level", "=", "ERROR")
    .groupBy("message")
    .orderBy("count", "desc")
    .limit(limit)
    .execute();
  }
}