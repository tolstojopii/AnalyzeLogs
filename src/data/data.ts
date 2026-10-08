import type { IconName } from "../components/Icon/Icon";
export type LogLevel = "ERROR" | "WARN" | "INFO" | "DEBUG";

export type Period = "1h" | "6h" | "24h" | "7d";

export const PERIOD_MS: Record<Period, number> = {
  "1h":  1 * 60 * 60 * 1000,
  "6h":  6 * 60 * 60 * 1000,
  "24h": 24 * 60 * 60 * 1000,
  "7d":  7 * 24 * 60 * 60 * 1000,
};

export interface LogEntry {
  timestamp: number;
  time: string;
  level: LogLevel;
  service: string;
  message: string;
  trace: string;
}
export interface StatCard {
  label: string;
  value: string;
  meta: string;
  tone: "cyan" | "rose" | "amber" | "emerald";
  icon: IconName;
  metaTone?: "danger";
}

export interface TopError {
  label: string;
  service: string;
  count: number;
  width: number;
}

export interface ErrorPoint {
  hour: string;
  errors: number;
}

export const initialLogs: LogEntry[] = [
  {
    timestamp: Date.now() - 5 * 60 * 1000, 
    time: "14:42:18.904",
    level: "ERROR",
    service: "payment-api",
    message: "Connection pool exhausted after 30000ms",
    trace: "req_8f31a",
  },
  {
    timestamp: Date.now() - 2 * 60 * 60 * 1000, 
    time: "14:42:16.217",
    level: "WARN",
    service: "auth-service",
    message: "Rate limit approaching for client 10.0.4.21",
    trace: "req_8f319",
  },
  {
    timestamp: Date.now() - 20 * 60 * 1000, 
    time: "16:21:54.547",
    level: "DEBUG",
    service: "reg-service",
    message: "Some error",
    trace: "req_9c381a",
  },
  {
    timestamp: Date.now() - 3 * 60 * 60 * 1000, 
    time: "14:42:13.041",
    level: "INFO",
    service: "edge-router",
    message: "Request completed in 84ms · GET /v2/health",
    trace: "req_8f318",
  },
  {
    timestamp: Date.now() - 6 * 60 * 60 * 1000, 
    time: "14:42:08.653",
    level: "ERROR",
    service: "worker-sync",
    message: "Failed to process queue message: invalid payload",
    trace: "req_8f317",
  },
  {
    timestamp: Date.now() - 5 * 60 * 60 * 1000,
    time: "14:42:02.190",
    level: "INFO",
    service: "user-service",
    message: "Profile cache refreshed successfully",
    trace: "req_8f316",
  },
  {
    timestamp: Date.now() - 7 * 24 * 60 * 60 * 1000,
    time: "14:41:58.772",
    level: "WARN",
    service: "database",
    message: "Slow query detected · duration 1247ms",
    trace: "req_8f315",
  },
];

export const incomingLogs: LogEntry[] = [
  {
    timestamp: Date.now() - 30 * 1000,
    time: "14:42:22.106",
    level: "INFO",
    service: "edge-router",
    message: "Request completed in 62ms · POST /v2/events",
    trace: "req_8f31b",
  },
  {
    timestamp: Date.now() -  15 * 1000,
    time: "14:42:25.448",
    level: "WARN",
    service: "cache-primary",
    message: "Memory usage above configured threshold · 82%",
    trace: "req_8f31c",
  },
  {
    timestamp: Date.now() - 45 * 1000,
    time: "14:42:29.813",
    level: "ERROR",
    service: "payment-api",
    message: "Upstream request failed with status 503",
    trace: "req_8f31d",
  },
];

export const topErrors: TopError[] = [
  {
    label: "Connection pool exhausted",
    service: "payment-api",
    count: 31,
    width: 100,
  },
  {
    label: "Request timeout after 30s",
    service: "edge-router",
    count: 24,
    width: 80,
  },
  {
    label: "Invalid authentication token",
    service: "auth-service",
    count: 18,
    width: 60,
  },
  {
    label: "Queue message rejected",
    service: "worker-sync",
    count: 13,
    width: 40,
  },
  {
    label: "Database constraint violation",
    service: "user-service",
    count: 8,
    width: 24,
  },
];

export const statCards: StatCard[] = [
  {
    label: "Total logs",
    value: "2.84M",
    meta: "12.4% vs yesterday",
    tone: "cyan",
    icon: "activity",
  },
  {
    label: "Errors",
    value: "94",
    meta: "3.3% error rate",
    tone: "rose",
    icon: "alert",
    metaTone: "danger",
  },
  {
    label: "Warnings",
    value: "317",
    meta: "11.1% of events",
    tone: "amber",
    icon: "activity",
  },
  {
    label: "Avg. latency",
    value: "184ms",
    meta: "24ms faster",
    tone: "emerald",
    icon: "activity",
  },
];

export const errorsOverTime: ErrorPoint[] = [
  { hour: "00:00", errors: 1 },

  { hour: "02:00", errors: 3 },

  { hour: "04:00", errors: 5 },

  { hour: "06:00", errors: 6 },

  { hour: "08:00", errors: 4 },

  { hour: "10:00", errors: 2 },

  { hour: "12:00", errors: 11 },

  { hour: "14:00", errors: 8 },

  { hour: "16:00", errors: 9 },

  { hour: "18:00", errors: 12 },
  { hour: "20:00", errors: 4 },
  { hour: "22:00", errors: 15 },
  { hour: "Now", errors: 12 },
];
