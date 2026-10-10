import { useEffect, useMemo, useState, useRef } from "react";
import { Icon } from "../Icon/Icon";
import { cx } from "../../utils/cx";
import s from "./LogStream.module.css";
import {
  type Period,
  type LogEntry,
  type LogLevel,
  PERIOD_MS,
} from "../../data/data";
import { downloadJSON } from "../../utils/download";

const LEVELS: readonly LogLevel[] = ["ERROR", "WARN", "INFO", "DEBUG"];

interface LogStreamProps {
  logs: LogEntry[];
  searchQuery: string;
  period: Period;
  onCopyTrace: (message: string) => void;
  onSelectLog: (log: LogEntry) => void;
}

function pillClass(level: LogLevel): string {
  switch (level) {
    case "ERROR":
      return `${s.pill} ${s.pillError}`;
    case "WARN":
      return `${s.pill} ${s.pillWarn}`;
    case "INFO":
      return `${s.pill} ${s.pillInfo}`;
    case "DEBUG":
      return `${s.pill} ${s.pillDebug}`;
    default:
      return s.pill;
  }
}

export function LogStream({
  logs,
  searchQuery,
  period,
  onCopyTrace,
  onSelectLog,
}: LogStreamProps) {
  const [levels, setLevels] = useState<LogLevel[]>([]);
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const [isServiceOpen, setIsServiceOpen] = useState<boolean>(false);
  const [serviceQuery, setServiceQuery] = useState("");

  const serviceFilterRef = useRef<HTMLDivElement>(null);
  const serviceSearchRef = useRef<HTMLInputElement>(null);

  const toggleService = () => {
    setIsServiceOpen((prev) =>{
      if (prev) setServiceQuery("");
      return !prev;
    });
  };

  const services = useMemo(() => {
    return [...new Set(logs.map((log) => log.service))].sort();
  }, [logs]);

  const toggleLevel = (level: LogLevel) => {
    setLevels((prev) =>
      prev.includes(level) ? prev.filter((l) => l !== level) : [...prev, level],
    );
  };

  const handleSelectService = (service: string | null) => {
    setSelectedService(service);
    setIsServiceOpen(false);
    setServiceQuery("");
  };

  const filteredServices = useMemo(() => {
    const q = serviceQuery.trim().toLowerCase();
    if (q === "") return services;
    return services.filter((svc) => svc.toLowerCase().includes(q));
  }, [services, serviceQuery]);

  const visibleLogs = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    const threshold = Date.now() - PERIOD_MS[period];
    return logs.filter((log) => {
      const matchesPeriod = log.timestamp >= threshold;
      const matchesLevel = levels.length === 0 || levels.includes(log.level);
      const matchesService =
        selectedService === null || log.service === selectedService;

      const matchesSearch =
        query === "" ||
        log.message.toLowerCase().includes(query) ||
        log.service.toLowerCase().includes(query) ||
        log.trace.toLowerCase().includes(query);

      return matchesLevel && matchesSearch && matchesPeriod && matchesService;
    });
  }, [levels, logs, searchQuery, period, selectedService]);

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      onCopyTrace("Copied!");
    } catch {
      onCopyTrace("Failed to copy");
    }
  };

  useEffect(() => {
    if (!isServiceOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsServiceOpen(false);
        setServiceQuery("");
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isServiceOpen]);

  const handleDownload = () => {
    const filename = `logs-${new Date().toISOString().slice(0, 10)}.json`;
    downloadJSON(visibleLogs, filename);
  };

  useEffect(() => {
    if (!isServiceOpen) return;
    const onClickOutside = (e: MouseEvent) => {
      if (serviceFilterRef.current?.contains(e.target as Node)) return;
      setIsServiceOpen(false);
      setServiceQuery("");
    };
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, [isServiceOpen]);

  useEffect(() => {
    if (isServiceOpen) {
      serviceSearchRef.current?.focus();
    }
  }, [isServiceOpen]);

  return (
    <section className={s.panel}>
      <div className={s.head}>
        <div>
          <div className={s.titleRow}>
            <p className={s.title}>Recent logs</p>
            <div className={s.streaming}>
              <span className={s.pingWrap}>
                <span className={s.ping} />
                <span className={s.pingCore} />
              </span>
              streaming
            </div>
          </div>
          <p className={s.subtitle}>Live events across all services</p>
        </div>

        <div className={s.controls}>
          <div className={s.serviceFilter} ref={serviceFilterRef}>
            <button
              type="button"
              className={s.toggleServiceOpen}
              onClick={toggleService}
              aria-label={`Service filter: ${selectedService ?? "All services"}`}
              aria-expanded={isServiceOpen}
            >
              <span>{selectedService ?? "All services"}</span>
              <Icon name="chevron" size={12} />
            </button>
            {isServiceOpen && (
              <div className={s.serviceDropdown}>
                <input
                  type="text"
                  ref={serviceSearchRef}
                  className={s.serviceSearch}
                  placeholder="Seacrh service..."
                  value={serviceQuery}
                  onChange={(e) => setServiceQuery(e.target.value)}
                  aria-label="Search service"
                />
                <button
                  type="button"
                  className={s.selectService}
                  onClick={() => handleSelectService(null)}
                >
                  All services
                </button>
                {filteredServices.map((svc) => (
                  <button
                    key={svc}
                    type="button"
                    onClick={() => handleSelectService(svc)}
                    className={s.serviceOption}
                  >
                    {svc}
                  </button>
                ))}
                {filteredServices.length === 0 && (
                  <div className={s.serviceEmpty}>No services found</div>
                )}
              </div>
            )}
          </div>

          <div className={s.tabs}>
            <button
              type="button"
              onClick={() => setLevels([])}
              className={cx(s.tab, levels.length === 0 && s.tabActive)}
            >
              ALL
            </button>
            {LEVELS.map((level) => {
              const isActive = levels.includes(level);
              return (
                <button
                  key={level}
                  type="button"
                  onClick={() => toggleLevel(level)}
                  className={cx(s.tab, isActive && s.tabActive)}
                >
                  {level}
                </button>
              );
            })}
          </div>

          <button type="button" className={s.filterButton} aria-label="Filter">
            <Icon name="filter" />
          </button>

          <button
            type="button"
            className={s.filterButton}
            onClick={handleDownload}
            aria-label="Download logs"
            disabled={visibleLogs.length === 0}
          >
            <Icon name="download" />
          </button>
        </div>
      </div>

      <div className={s.scroll}>
        <div className={s.table}>
          <div className={s.tableHead}>
            <span>Time</span>
            <span>Level</span>
            <span>Service</span>
            <span>Message</span>
            <span>Trace</span>
          </div>

          <div>
            {visibleLogs.map((log) => (
              <div
                key={`${log.time}-${log.trace}`}
                className={s.row}
                onClick={() => onSelectLog(log)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    onSelectLog(log);
                  }
                }}
              >
                <span className={s.time}>{log.time}</span>
                <span>
                  <span className={pillClass(log.level)}>{log.level}</span>
                </span>
                <span className={s.service}>{log.service}</span>
                <span className={s.message}>{log.message}</span>
                <span className={s.trace}>
                  {log.trace.slice(-6)}
                  <button
                    className={s.traceCopy}
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCopy(log.trace);
                    }}
                    aria-label={`Copy trace ${log.trace}`}
                  >
                    <Icon name="copy" size={12} />
                  </button>
                </span>
              </div>
            ))}
            {visibleLogs.length === 0 && (
              <div className={s.empty}>
                No logs match your filters. Try a different period or clear the
                search
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
