import { Kysely, PostgresDialect } from "kysely";
import pg from "pg";
import { config } from "../config";
import type { Database } from "./types";

const { Pool } = pg;

const pool = new Pool({
  connectionString: config.DATABASE_URL,
  max: 10, //ограничение
  idleTimeoutMillis: 30_000, // 30 сек на коннект
});

export const db = new Kysely<Database>({
  dialect: new PostgresDialect({ pool }),
});
