import { LogEntry } from "../../data/data";
import { Icon } from "../Icon/Icon";
import s from "./LogDetails.module.css";

interface LogDetailsProps {
  log: LogEntry;
  onClose: () => void;
  onCopyTrace: (text: string) => void;
}

export function LogDetails({ log, onClose, onCopyTrace }: LogDetailsProps) {
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(log.trace);
      onCopyTrace("Copied!");
    } catch {
      onCopyTrace("Failed to copy");
    }
  };
  return (
    <>
      <div className={s.overlay} onClick={onClose} aria-hidden="true" />
      <aside
        className={s.drawer}
        role="dialog"
        aria-modal="true"
        aria-label="Log details"
      >
        <header className={s.header}>
          <h2 className={s.title}>Log details</h2>
          <button
            className={s.closeButton}
            type="button"
            onClick={onClose}
            aria-label="Close"
          >
            <Icon name="close" size={20} />
          </button>
        </header>
        <div className={s.body}>
          <div className={s.field}>
            <span className={s.label}>Time</span>
            <span className={s.value}>{log.time}</span>
          </div>
          <div className={s.field}>
            <span className={s.label}>Level</span>
            <span className={s.value}>{log.level}</span>
          </div>
          <div className={s.field}>
            <span className={s.label}>Service</span>
            <span className={s.value}>{log.service}</span>
          </div>
          <div className={s.field}>
            <span className={s.label}>Trace</span>
            <div className={s.traceRow}>
              <span className={s.value}>
                {log.trace}
                <button
                  type="button"
                  className={s.copyButton}
                  onClick={handleCopy}
                  aria-label={`Copy trace ${log.trace}`}
                >
                  <Icon name="copy" size={12} />
                </button>
              </span>
            </div>
          </div>
          <div className={s.field}>
            <span className={s.label}>Message</span>
            <span className={s.value}>{log.message}</span>
          </div>
        </div>
      </aside>
    </>
  );
}
