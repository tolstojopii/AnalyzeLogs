import { useEffect, useState } from "react";
import { Sidebar } from "./components/Sidebar/Sidebar";
import { Header } from "./components/Header/Header";
import { StatCard } from "./components/StatCard/StatCard";
import { ErrorsChart } from "./components/ErrorsChart/ErrorsChart";
import { TopErrors } from "./components/TopErrors/TopErrors";
import { LogStream } from "./components/LogStream/LogStream";
import { Toast } from "./components/Toast/Toast";
import { type Period, initialLogs, incomingLogs, type LogEntry } from "./data/data";
import s from "./App.module.css";
import { LogDetails } from "./components/LogDetails/LogDetails";

export default function App() {
  const [logs, setLogs] = useState(initialLogs);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [period, setPeriod] = useState<Period>("24h");
  const [toast, setToast] = useState<string | null>(null);
  const [selectedLog, setSelectedLog] = useState<LogEntry | null>(null);

  useEffect(() => {
    const timers = incomingLogs.map((log, index) =>
      window.setTimeout(
        () => {
          setLogs((current) => [log, ...current].slice(0, 8));
        },
        (index + 1) * 4200,
      ),
    );

    return () => timers.forEach(window.clearTimeout);
  }, []);

  useEffect(() => {
    if (!selectedLog) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSelectedLog(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [selectedLog]);

  useEffect(() => {
    if (!isSidebarOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsSidebarOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isSidebarOpen]);

  return (
    <div className={s.page}>
      <div className={s.shell}>
        <Sidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />

        <main className={s.main}>
          <Header
            onMenuClick={() => setIsSidebarOpen(true)}
            searchQuery={searchQuery}
            onSearchQuery={setSearchQuery}
          />

          <div className={s.content}>
            <div className={s.pageHead}>
              <div>
                <div className={s.titleRow}>
                  <p className={s.title}>System overview</p>
                  <div className={s.live}>
                    <span className={s.liveDot} />
                    Live
                  </div>
                </div>
                <p className={s.subtitle}>
                  Health and activity across your production environment.
                </p>
              </div>

              <div className={s.filters}>
                <select
                  className={s.period}
                  value={period}
                  onChange={(e) => setPeriod(e.target.value as Period)}
                  aria-label="Time period"
                >
                  <option value="1h">1 hour</option>
                  <option value="6h">6 hours</option>
                  <option value="24h">24 hours</option>
                  <option value="7d">7 days</option>
                </select>
              </div>
            </div>

            <StatCard />

            <section className={s.charts}>
              <ErrorsChart />
              <TopErrors />
            </section>

            <LogStream
              logs={logs}
              searchQuery={searchQuery}
              period={period}
              onCopyTrace={setToast}
              onSelectLog={setSelectedLog}
            />
          </div>
        </main>
      </div>
      {selectedLog && (
        <LogDetails
          log={selectedLog}
          onClose={() => setSelectedLog(null)}
          onCopyTrace={setToast}
        />
      )}
      <Toast message={toast} onClose={() => setToast(null)} />
    </div>
  );
}
