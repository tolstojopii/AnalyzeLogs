import type { ErrorPoint, LogEntry, LogLevel, TopError } from "../data/data";

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
  const count = Number(raw.count);
  return {
    label: raw.message,
    count,
    service: "",
    width: maxCount > 0 ? Math.round((count / maxCount) * 100) : 0,
  };
}

export async function fetchLogs(params?: {
  before?: number;
  level?: LogLevel;
  service?: string;
  since?: string;
  limit?: number;
}): Promise<{ logs: LogEntry[]; nextCursor: number | null }> {
  const urlSearch = new URLSearchParams();

  if (params?.before) {
    urlSearch.set("before", `${params?.before}`);
  }
  if (params?.level) {
    urlSearch.set("level", `${params?.level}`);
  }
  if (params?.service) {
    urlSearch.set("service", `${params?.service}`);
  }
  if (params?.since) {
    urlSearch.set("since", `${params?.since}`);
  }
  if (params?.limit) {
    urlSearch.set("limit", `${params?.limit}`);
  }


  const response = await fetch("/api/logs" + "?" + urlSearch.toString())
  if (!response.ok) {
    throw new Error(`Failed to load logs: ${response.status}`);
  }
  const data: { logs: BackendLog[]; nextCursor: string | null } =
    await response.json();

  return {
    logs: data.logs.map(mapLog),
    nextCursor: data.nextCursor === null ? null : Number(data.nextCursor),
  };
}

export async function fetchErrorsOverTime(): Promise<ErrorPoint[]> {
  const response = await fetch("/api/logs/stats/over-time");

  if (!response.ok) {
    throw new Error(`Failed to load logs: ${response.status}`);
  }
  const data: { points: BackendErrorPoint[] } = await response.json();

  return data.points.map(mapErrorPoint);
}

export async function fetchTopErrors(): Promise<TopError[]> {
  const response = await fetch("/api/logs/stats/top");

  if (!response.ok) {
    throw new Error(`Failed to load logs: ${response.status}`);
  }
  const data: { top: BackendTopError[] } = await response.json();
  const maxCount = Math.max(...data.top.map((t) => Number(t.count)));
  return data.top.map((raw) => mapTopError(raw, maxCount));
}
