import { useEffect, useMemo, useState, useRef } from "react";
import { Icon } from "../Icon/Icon";
import { cx } from "../../utils/cx";
import s from "./LogStream.module.css";
import {type LogEntry, type LogLevel } from "../../data/data";
import { downloadJSON } from "../../utils/download";
import { useCopyToClipboard } from "../../hooks/useCopyToClipboard";
import { useEscapeKey } from "../../hooks/useEscapeKey";
import { useClickOutside } from "../../hooks/useClickOutside";
import { formatTime } from "../../utils/formatTime";

const LEVELS: readonly LogLevel[] = ["ERROR", "WARN", "INFO", "DEBUG"];

interface LogStreamProps {
  logs: LogEntry[];
  onCopyTrace: (message: string) => void;
  onSelectLog: (log: LogEntry) => void;
  onResetAppFilters: () => void;
  onLoadMore: () => void;
  hasMore: boolean;
  levels: LogLevel[];
  service: string | null;
  onLevelsChange: (levels: LogLevel[]) => void;
  onServiceChange: (service: string | null) => void;
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
  onCopyTrace,
  onSelectLog,
  onResetAppFilters,
  onLoadMore,
  hasMore,
  levels,
  service,
  onLevelsChange,
  onServiceChange,
}: LogStreamProps) {
  const [isServiceOpen, setIsServiceOpen] = useState<boolean>(false);
  const [serviceQuery, setServiceQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(-1);
  const serviceFilterRef = useRef<HTMLDivElement>(null);
  const serviceSearchRef = useRef<HTMLInputElement>(null);

  const handleResetAll = () => {
    onLevelsChange([]);
    onServiceChange(null);
    setServiceQuery("");
    setActiveIndex(-1);
    onResetAppFilters();
  };

  const toggleService = () => {
    setIsServiceOpen((prev) => {
      if (prev) setServiceQuery("");
      return !prev;
    });
  };

  const services = useMemo(() => {
    return [...new Set(logs.map((log) => log.service))].sort();
  }, [logs]);

  const toggleLevel = (level: LogLevel) => {
    onLevelsChange(
      levels.includes(level)
        ? levels.filter((l) => l !== level)
        : [...levels, level],
    );
  };

  const handleSelectService = (service: string | null) => {
    onServiceChange(service);
    setIsServiceOpen(false);
    setServiceQuery("");
    setActiveIndex(-1);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((prev) =>
        prev < filteredServices.length - 1 ? prev + 1 : prev,
      );
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((prev) => (prev > 0 ? prev - 1 : prev));
    }

    if (e.key === "Enter") {
      e.preventDefault();
      if (activeIndex >= 0 && activeIndex < filteredServices.length) {
        handleSelectService(filteredServices[activeIndex]);
      }
    }
  };

  const filteredServices = useMemo(() => {
    const q = serviceQuery.trim().toLowerCase();
    if (q === "") return services;
    return services.filter((svc) => svc.toLowerCase().includes(q));
  }, [services, serviceQuery]);

  const visibleLogs = logs;

  const copy = useCopyToClipboard(onCopyTrace);

  useEscapeKey(isServiceOpen, () => {
    setIsServiceOpen(false);
    setServiceQuery("");
    setActiveIndex(-1);
  });

  const handleDownload = () => {
    const filename = `logs-${new Date().toISOString().slice(0, 10)}.json`;
    downloadJSON(visibleLogs, filename);
  };

  useClickOutside(isServiceOpen, serviceFilterRef, () => {
    setIsServiceOpen(false);
    setServiceQuery("");
    setActiveIndex(-1);
  });

  useEffect(() => {
    if (isServiceOpen) {
      serviceSearchRef.current?.focus();
    }
  }, [isServiceOpen]);

  useEffect(() => {
    if (activeIndex < 0) return;
    const dropdown = serviceFilterRef.current?.querySelector(
      `.${s.serviceOption}:nth-of-type(${activeIndex + 1})`,
    );
    dropdown?.scrollIntoView({ block: "nearest" });
  }, [activeIndex]);

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
              aria-label={`Service filter: ${service ?? "All services"}`}
              aria-expanded={isServiceOpen}
            >
              <span>{service ?? "All services"}</span>
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
                  onChange={(e) => {
                    setServiceQuery(e.target.value);
                    setActiveIndex(-1);
                  }}
                  onKeyDown={handleKeyDown}
                  aria-label="Search service"
                />
                <button
                  type="button"
                  className={s.selectService}
                  onClick={() => handleSelectService(null)}
                >
                  All services
                </button>
                {filteredServices.map((svc, index) => (
                  <button
                    key={svc}
                    type="button"
                    onClick={() => handleSelectService(svc)}
                    className={cx(
                      s.serviceOption,
                      index === activeIndex && s.serviceOptionActive,
                    )}
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
              onClick={() => onLevelsChange([])}
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

          <div className={s.logs}>
            {visibleLogs.map((log) => (
              <div
                key={log.id}
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
                <span className={s.time}>{formatTime(log.timestamp)}</span>
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
                      copy(log.trace);
                    }}
                    aria-label={`Copy trace ${log.trace}`}
                  >
                    <Icon name="copy" size={12} />
                  </button>
                </span>
              </div>
            ))}
            {hasMore && visibleLogs.length !== 0 && (
              <button className={s.moreLogs} onClick={() => onLoadMore()}>
                More logs
              </button>
            )}

            {visibleLogs.length === 0 && (
              <div className={s.empty}>
                <p className={s.emptyText}>
                  No logs match your filters. Try a different period or clear
                  the search
                </p>
                <button className={s.emptyButton} onClick={handleResetAll}>
                  Reset filters
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
