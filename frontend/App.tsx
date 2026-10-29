import { useEffect, useState } from "react";
import { Sidebar } from "./components/Sidebar/Sidebar";
import { Header } from "./components/Header/Header";
import { StatCard } from "./components/StatCard/StatCard";
import { ErrorsChart } from "./components/ErrorsChart/ErrorsChart";
import { TopErrors } from "./components/TopErrors/TopErrors";
import { LogStream } from "./components/LogStream/LogStream";
import { Toast } from "./components/Toast/Toast";
import { type Period, type LogEntry, ErrorPoint, TopError, PERIOD_MS } from "./data/data";
import s from "./App.module.css";
import { LogDetails } from "./components/LogDetails/LogDetails";
import { useEscapeKey } from "./hooks/useEscapeKey";
import { fetchErrorsOverTime, fetchLogs, fetchTopErrors } from "./api/logs";

export default function App() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [nextCursor, setNextCursor] = useState<number | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [period, setPeriod] = useState<Period>("24h");
  const [toast, setToast] = useState<string | null>(null);
  const [selectedLog, setSelectedLog] = useState<LogEntry | null>(null);
  const [errorPoints, setErrorPoints] = useState<ErrorPoint[]>([]);
  const [topErrors, setTopErrors] = useState<TopError[]>([]);

  const handleResetAppFilters = () => {
    setSearchQuery("");
    setPeriod("24h");
  };

  async function loadMore() {
    if (nextCursor === null) return;
    const date = new Date(Date.now() - PERIOD_MS[period]).toISOString()
    try {
      const { logs: newLogs, nextCursor: cursor } = await fetchLogs({
        before: nextCursor, since: date,
      });
      setLogs((prev) => [...prev, ...newLogs]);
      setNextCursor(cursor);
    } catch (err) {
      console.error("Не удалось загрузить логи", err);
    }
  }

  useEffect(() => {
    async function loadLogs() {
      const date = new Date(Date.now() - PERIOD_MS[period]).toISOString()
      setLogs([])
      setNextCursor(null)
      try {
        const data = await fetchLogs({since: date});
        setLogs(data.logs);
        setNextCursor(data.nextCursor);
        
      } catch (err) {
        console.error("Не удалось загрузить логи:", err);
      }
    }
    loadLogs();
  }, [period]);

  useEffect(() => {
    async function loadTopErrors() {
      try {
        const data = await fetchTopErrors();
        setTopErrors(data);
        
      } catch (err) {
        console.error("Не удалось загрузить топ ошибок:", err);
      }
    }
    loadTopErrors();
  }, []);

  useEffect(() => {
    async function loadErrorPoint() {
      try {
        const data = await fetchErrorsOverTime();
        setErrorPoints(data);
        
      } catch (err) {
        console.error("Не удалось загрузить точки графика:", err);
      }
    }
    loadErrorPoint();
  }, []);

  useEscapeKey(selectedLog !== null, () => setSelectedLog(null));
  useEscapeKey(isSidebarOpen, () => setIsSidebarOpen(false));

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
              <ErrorsChart points={errorPoints} />
              <TopErrors errors={topErrors} />
            </section>

            <LogStream
              logs={logs}
              searchQuery={searchQuery}
              period={period}
              onCopyTrace={setToast}
              onSelectLog={setSelectedLog}
              onResetAppFilters={handleResetAppFilters}
              onLoadMore={loadMore}
              hasMore={nextCursor !== null}
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
