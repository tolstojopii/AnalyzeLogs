import type { IconName } from "../components/Icon/Icon";
export type LogLevel = "ERROR" | "WARN" | "INFO" | "DEBUG";

export type Period = "1h" | "6h" | "24h" | "7d";

export const PERIOD_MS: Record<Period, number> = {
  "1h": 1 * 60 * 60 * 1000,
  "6h": 6 * 60 * 60 * 1000,
  "24h": 24 * 60 * 60 * 1000,
  "7d": 7 * 24 * 60 * 60 * 1000,
};

export interface LogEntry {
  timestamp: number;
  id: string;
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
