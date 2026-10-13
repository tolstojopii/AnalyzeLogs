#!/usr/bin/env -S node
import type { Contract as End } from '../../snapshots/273636d80e51840fc00a951839f432015297fbdcbe99d79d2bb66e4a46c46930/contract';
import endContract from '../../snapshots/273636d80e51840fc00a951839f432015297fbdcbe99d79d2bb66e4a46c46930/contract.json' with { type: 'json' };
import { Migration, MigrationCLI, col, fn, primaryKey } from '@prisma/orm-postgres/migration';

export default class M extends Migration<never, End> {
  override readonly endContractJson = endContract;

  override get operations() {
    return [
      this.createSchema({ schema: 'public' }),
      this.createTable({
        schema: 'public',
        table: 'Log',
        columns: [
          col('createdAt', 'timestamptz', {
            notNull: true,
            default: fn('now()'),
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
          col('id', 'SERIAL', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('level', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('message', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('service', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('timestamp', 'timestamptz', {
            notNull: true,
            default: fn('now()'),
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
          col('trace', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('updatedAt', 'timestamptz', {
            notNull: true,
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
        ],
        constraints: [primaryKey(['id'])],
      }),
      this.addUnique({
        schema: 'public',
        table: 'Log',
        constraint: 'Log_trace_key',
        columns: ['trace'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'Log',
        index: 'Log_level_idx_30977cf3',
        columns: ['level'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'Log',
        index: 'Log_service_idx_747837fe',
        columns: ['service'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'Log',
        index: 'Log_timestamp_idx_a2429bb8',
        columns: ['timestamp'],
      }),
    ];
  }
}

MigrationCLI.run(import.meta.url, M);
