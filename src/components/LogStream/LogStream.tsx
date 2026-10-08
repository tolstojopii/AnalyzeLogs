import { useMemo, useState } from "react";
import { Icon } from "../Icon/Icon";
import { cx } from "../../utils/cx";
import s from "./LogStream.module.css";
import type { LogEntry, LogLevel } from "../../data/data";

const LEVELS: readonly LogLevel[] = ["ERROR", "WARN", "INFO", "DEBUG"];

interface LogStreamProps {
  logs: LogEntry[];
  searchQuery: string;
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

export function LogStream({ logs, searchQuery }: LogStreamProps) {
  const [levels, setLevels] = useState<LogLevel[]>([]);

  const toggleLevel = (level: LogLevel) => {
  setLevels(prev =>
    prev.includes(level)
      ? prev.filter(l => l !== level) 
      : [...prev, level],               
  );
};

  const visibleLogs = useMemo(() => {
    const query = searchQuery.trim().toLocaleLowerCase();

    return logs.filter((log) => {
      const matchesLevel = levels.length === 0 || levels.includes(log.level);

      const matchesSearch =
        query === "" ||
        log.message.toLowerCase().includes(query) ||
        log.service.toLowerCase().includes(query) ||
        log.trace.toLowerCase().includes(query);

      return matchesLevel && matchesSearch;
    });
  }, [levels, logs, searchQuery]);

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
            <button
              type="button"
              onClick={() => setLevels([])}
              className={cx(s.tab, levels.length === 0 && s.tabActive)}
            >
              ALL
            </button>

            {LEVELS.map((level) => {
              const isActive = levels.includes(level);

              return <button key={level} type="button" onClick={()=> toggleLevel(level)} className={cx(s.tab, isActive && s.tabActive)}>{level}</button>;
            })}
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
              <div className={s.empty}>logs empty</div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
