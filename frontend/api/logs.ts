import type { ErrorPoint, LogEntry, TopError } from "../data/data";

interface BackendLog {
  id: string;
  timestamp: string;
  level: "ERROR" | "WARN" | "INFO" | "DEBUG";
  service: string;
  message: string;
  trace: string;
}

interface BackendErrorPoint {
  hour: string;
  errors: string;
}

interface BackendTopError {
  message: string;
  count: string;
}

function mapLog(raw: BackendLog): LogEntry {
  return {
    id: raw.id,
    timestamp: Date.parse(raw.timestamp),
    level: raw.level,
    service: raw.service,
    message: raw.message,
    trace: raw.trace,
  };
}

function mapErrorPoint(raw: BackendErrorPoint): ErrorPoint {
  const hoursDate =
    String(new Date(raw.hour).getUTCHours()).padStart(2, "0") + ":00";
  return {
    hour: hoursDate,
    errors: Number(raw.errors),
  };
}

function mapTopError(raw: BackendTopError, maxCount: number): TopError {
  const count = Number(raw.count)
  return {
    label: raw.message,
    count,
    service: "",
    width: maxCount > 0 ? Math.round((count / maxCount)*100) : 0,
  };
}

export async function fetchLogs(): Promise<LogEntry[]> {
  const response = await fetch("/api/logs");

  if (!response.ok) {
    throw new Error(`Failed to load logs: ${response.status}`);
  }
  const data: { logs: BackendLog[] } = await response.json();

  return data.logs.map(mapLog);
}

export async function fetchErrorsOverTime(): Promise<ErrorPoint[]> {
  const response = await fetch("/api/logs/stats/over-time");

  if (!response.ok) {
    throw new Error(`Failed to load logs: ${response.status}`);
  }
  const data: { points: BackendErrorPoint[] } = await response.json();

  return data.points.map(mapErrorPoint);
}

export async function fetchTopErrors(): Promise<TopError[]>{
  const response = await fetch("/api/logs/stats/top");

  if (!response.ok) {
    throw new Error(`Failed to load logs: ${response.status}`);
  }
  const data: { top: BackendTopError[] } = await response.json();
  const maxCount= Math.max(...data.top.map((t)=> Number(t.count)))
  return data.top.map((raw)=> mapTopError(raw, maxCount))
}
