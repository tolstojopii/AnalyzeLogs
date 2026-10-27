import * as m001_createLogs from "./001_create_logs"
import type { Kysely } from "kysely";


export interface Migration{
  up: (db: Kysely<unknown>) => Promise<void>;
  down: (db: Kysely<unknown>) => Promise<void>;
}

export const migrations: Record<string, Migration> = {
  "001_create_logs": m001_createLogs
}