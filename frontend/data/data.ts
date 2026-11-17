
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
