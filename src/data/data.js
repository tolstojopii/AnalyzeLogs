/**
 * @typedef {"ERROR" | "WARN" | "INFO"} LogLevel
 *
 * @typedef {Object} LogEntry
 * @property {string} time
 * @property {LogLevel} level
 * @property {string} service
 * @property {string} message
 * @property {string} trace
 */

/** @type {LogEntry[]} */
export const initialLogs = [
  { time: "14:42:18.904", level: "ERROR", service: "payment-api", message: "Connection pool exhausted after 30000ms", trace: "req_8f31a" },
  { time: "14:42:16.217", level: "WARN", service: "auth-service", message: "Rate limit approaching for client 10.0.4.21", trace: "req_8f319" },
  { time: "14:42:13.041", level: "INFO", service: "edge-router", message: "Request completed in 84ms · GET /v2/health", trace: "req_8f318" },
  { time: "14:42:08.653", level: "ERROR", service: "worker-sync", message: "Failed to process queue message: invalid payload", trace: "req_8f317" },
  { time: "14:42:02.190", level: "INFO", service: "user-service", message: "Profile cache refreshed successfully", trace: "req_8f316" },
  { time: "14:41:58.772", level: "WARN", service: "database", message: "Slow query detected · duration 1247ms", trace: "req_8f315" },
];

/** @type {LogEntry[]} */
export const incomingLogs = [
  { time: "14:42:22.106", level: "INFO", service: "edge-router", message: "Request completed in 62ms · POST /v2/events", trace: "req_8f31b" },
  { time: "14:42:25.448", level: "WARN", service: "cache-primary", message: "Memory usage above configured threshold · 82%", trace: "req_8f31c" },
  { time: "14:42:29.813", level: "ERROR", service: "payment-api", message: "Upstream request failed with status 503", trace: "req_8f31d" },
];

export const topErrors = [
  { label: "Connection pool exhausted", service: "payment-api", count: 31, width: 100 },
  { label: "Request timeout after 30s", service: "edge-router", count: 24, width: 80 },
  { label: "Invalid authentication token", service: "auth-service", count: 18, width: 60 },
  { label: "Queue message rejected", service: "worker-sync", count: 13, width: 40 },
  { label: "Database constraint violation", service: "user-service", count: 8, width: 24 },
];

export const statCards = [
  { label: "Total logs", value: "2.84M", meta: "12.4% vs yesterday", tone: "cyan", icon: "activity" },
  { label: "Errors", value: "94", meta: "3.3% error rate", tone: "rose", icon: "alert", metaTone: "danger" },
  { label: "Warnings", value: "317", meta: "11.1% of events", tone: "amber", icon: "activity" },
  { label: "Avg. latency", value: "184ms", meta: "24ms faster", tone: "emerald", icon: "activity" },
];