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
  service: string;
}

interface BackendStreamEvent {
  logs?: BackendLog[];
}

interface BackendSummary{
  total: number;
  errors: number;
  warns: number;
}

interface BackendServices{
  services: {service: string}[]
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
    service: raw.service,
    width: maxCount > 0 ? Math.round((count / maxCount) * 100) : 0,
  };
}

export async function fetchLogs(params?: {
  before?: number;
  level?: LogLevel[];
  service?: string;
  search?: string;
  since?: string;
  limit?: number;
}): Promise<{ logs: LogEntry[]; nextCursor: number | null }> {
  const urlSearch = new URLSearchParams();

  if (params?.before) {
    urlSearch.set("before", `${params?.before}`);
  }
  if (params?.level && params.level.length > 0) {
    for (const l of params.level) {
      urlSearch.append("level", l);
    }
  }
  if (params?.service) {
    urlSearch.set("service", `${params?.service}`);
  }
  if(params?.search){
    urlSearch.set("search", params.search)
  }
  if (params?.since) {
    urlSearch.set("since", `${params?.since}`);
  }
  if (params?.limit) {
    urlSearch.set("limit", `${params?.limit}`);
  }

  const response = await fetch("/api/logs" + "?" + urlSearch.toString());
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

export async function fetchErrorsOverTime(hoursBack?: number): Promise<ErrorPoint[]> {

  const urlSearch = new URLSearchParams()
  if(hoursBack){
    urlSearch.set("hoursBack", String(hoursBack))
  }

  const response = await fetch("/api/logs/stats/over-time" + "?" + urlSearch.toString());

  if (!response.ok) {
    throw new Error(`Failed to load logs: ${response.status}`);
  }
  const data: { points: BackendErrorPoint[] } = await response.json();

  return data.points.map(mapErrorPoint);
}

export async function fetchTopErrors(since?: string): Promise<TopError[]> {

  const urlSearch = new URLSearchParams()
  if(since){
    urlSearch.set("since", since)
  }

  const response = await fetch("/api/logs/stats/top" + "?" + urlSearch.toString());

  if (!response.ok) {
    throw new Error(`Failed to load logs: ${response.status}`);
  }
  const data: { top: BackendTopError[] } = await response.json();
  const maxCount = Math.max(...data.top.map((t) => Number(t.count)));
  return data.top.map((raw) => mapTopError(raw, maxCount));
}


interface StreamFilters {
  level?: LogLevel[];
  service?: string;
  search?: string
}

export function subscribeToLogs(
  after: number,
  onLogs: (logs: LogEntry[]) => void,
  filters?: StreamFilters,
): EventSource {
  
  const urlSearch = new URLSearchParams();

  if(filters?.level && filters.level.length > 0){
    for (const l of filters.level) 
    urlSearch.append("level", l)  
  }
  if(filters?.service){
    urlSearch.set("service", `${filters.service}`)
  }
  if(filters?.search){
    urlSearch.set("search", `${filters.search}`)
  }
    urlSearch.set("after", String(after))
  const es = new EventSource(`/api/logs/stream` + '?' + urlSearch.toString());
  
  es.addEventListener("message", (event) => {
    const parsed: BackendStreamEvent = JSON.parse(event.data);
    if (!parsed.logs) return;
    const parsedLogs = parsed.logs.map(mapLog);
    onLogs(parsedLogs);
  });
  return es;
}


export async function fetchSummary(since?: string): Promise<BackendSummary>{

  const urlSearch = new URLSearchParams()

  if(since){
    urlSearch.set("since", since)
  }

  const response = await fetch("/api/logs/stats/summary" + "?" + urlSearch.toString()) ;
  if(!response.ok){
    throw new Error(`Failed to load summary: ${response.status}`)
  }

  const data: BackendSummary = await response.json();
  return data;
}

export async function fetchServices(since?:string ): Promise<string[]>{
  const urlSearch = new URLSearchParams()
  if(since){
    urlSearch.set("since", since)
  }

  const response = await fetch("/api/logs/services" + "?" + urlSearch.toString())
  if(!response.ok){
    throw new Error(`Failed to load services: ${response.status}`)
  }
  const data: BackendServices = await response.json()
  return data.services.map(r => r.service)
}