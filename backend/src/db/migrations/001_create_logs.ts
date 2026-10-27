import { sql, type Kysely } from "kysely";

export async function up(db: Kysely<unknown>): Promise<void> {
  await db.schema
    .createTable("logs")
    .addColumn("id", "bigint", (col) =>
      col.primaryKey().generatedAlwaysAsIdentity(),
    )
    .addColumn("timestamp", "timestamptz", (col) => col.notNull())
    .addColumn("level", "text", (col) =>
      col.notNull().check(sql`level IN ('ERROR', 'WARN','INFO','DEBUG')`),
    )
    .addColumn("service", "text", (col) => col.notNull())
    .addColumn("message", "text", (col) => col.notNull())
    .addColumn("trace", "text", (col) => col.notNull())
    .execute();

  // Индекс для сортировки/фильтра по времени (самый частый запрос — "последние N логов").
  await db.schema
    .createIndex("idx_logs_timestamp")
    .on("logs")
    .column("timestamp")
    .execute();

  // Индекс для фильтра по уровню + времени.
  await db.schema
    .createIndex("idx_logs_level_timestamp")
    .on("logs")
    .columns(["level", "timestamp"])
    .execute();

  // Индекс для фильтра по сервису + времени.
  await db.schema
    .createIndex("idx_logs_service_timestamp")
    .on("logs")
    .columns(["service", "timestamp"])
    .execute();
}

export async function down(db: Kysely<unknown>): Promise<void> {
  await db.schema.dropTable("logs").ifExists().execute();
}
