import type { ColumnType } from "kysely";

export interface LogsTable {
  // bigint identity: БД сама генерирует id.
  // ColumnType<Select, Insert, Update>:
  //  - Select  = number   → при чтении (SELECT) id это number
  //  - Insert  = never    → при вставке id НЕ передаём (запрещено типом)
  //  - Update  = never    → id менять нельзя
  id: ColumnType<number, never, never>;
  timestamp: ColumnType<Date, Date | string, Date | string>;
  level: "ERROR" | "WARN" | "INFO" | "DEBUG";
  service: string;
  message: string;
  trace: string;
}

export interface Database {
  logs: LogsTable;
}
