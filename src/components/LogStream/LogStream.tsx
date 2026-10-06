import { useMemo, useState } from "react";
import { Icon } from "../Icon/Icon";
import { cx } from "../../utils/cx";
import s from "./LogStream.module.css";
import type { LogEntry, LogLevel } from "../../data/data";

type Filter = LogLevel | "ALL"

const FILTERS: readonly Filter[] = ["ALL", "ERROR", "WARN", "INFO"];

interface LogStreamProps{
  logs: LogEntry[];
}

function pillClass(level: LogLevel):string {
  switch (level) {
    case "ERROR": return `${s.pill} ${s.pillError}`;
    case "WARN":  return `${s.pill} ${s.pillWarn}`;
    case "INFO":  return `${s.pill} ${s.pillInfo}`;
    default:      return s.pill;
  }
}

export function LogStream({ logs }: LogStreamProps) {
  const [filter, setFilter] = useState<Filter>("ALL");

  const visibleLogs = useMemo(
    () => logs.filter((log) => filter === "ALL" || log.level === filter),
    [filter, logs],
  );

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
          <div className={s.tabs}>
            {FILTERS.map((level) => (
              <button
                key={level}
                type="button"
                onClick={() => setFilter(level)}
                className={cx(s.tab, filter === level && s.tabActive)}
              >
                {level}
              </button>
            ))}
          </div>
          <button type="button" className={s.filterButton} aria-label="Filter">
            <Icon name="filter" />
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
              <div key={`${log.time}-${log.trace}`} className={s.row}>
                <span className={s.time}>{log.time}</span>
                <span>
                  <span className={pillClass(log.level)}>{log.level}</span>
                </span>
                <span className={s.service}>{log.service}</span>
                <span className={s.message}>{log.message}</span>
                <span className={s.trace}>
                  {log.trace.slice(-6)}
                  <Icon name="copy" size={12} />
                </span>
              </div>
            ))}
            {visibleLogs.length === 0 && (
              <div className={s.empty}>No logs match this level.</div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

