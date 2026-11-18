import { useEffect, useState } from "react";
import { Sidebar } from "./components/Sidebar/Sidebar";
import { Header } from "./components/Header/Header";
import { StatCard } from "./components/StatCard/StatCard";
import { ErrorsChart } from "./components/ErrorsChart/ErrorsChart";
import { TopErrors } from "./components/TopErrors/TopErrors";
import { LogStream } from "./components/LogStream/LogStream";
import { Toast } from "./components/Toast/Toast";
import {
  type Period,
  type LogEntry,
  ErrorPoint,
  TopError,
  PERIOD_MS,
  LogLevel,
  RequestStatus,
} from "./data/data";
import s from "./App.module.css";
import { LogDetails } from "./components/LogDetails/LogDetails";
import { useEscapeKey } from "./hooks/useEscapeKey";
import {
  fetchErrorsOverTime,
  fetchLogs,
  fetchServices,
  fetchSummary,
  fetchTopErrors,
  subscribeToLogs,
} from "./api/logs";
import { useDebounce } from "./hooks/useDebounce";
import { runQuery } from "./utils/runQuery";

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
  const [levels, setLevels] = useState<LogLevel[]>([]);
  const [service, setService] = useState<string | null>(null);
  const [summary, setSummary] = useState({ total: 0, errors: 0, warns: 0 });
  const [summaryStatus, setSummaryStatus] = useState<RequestStatus>("idle");
  const [topStatus, setTopStatus] = useState<RequestStatus>("idle");
  const [chartStatus, setChartStatus] = useState<RequestStatus>("idle");
  const [services, setServices] = useState<string[]>([]);
  const [logsStatus, setLogsStatus] = useState<RequestStatus>("idle");
  const [reloadKey, setReloadKey] = useState(0);
  const debouncedSearch = useDebounce(searchQuery, 400);

  const handleResetAppFilters = () => {
    setSearchQuery("");
    setPeriod("24h");
  };

  const hasActiveFilters =
    levels.length > 0 || service !== null || debouncedSearch !== "";

  async function loadMore() {
    if (nextCursor === null) return;
    const date = new Date(Date.now() - PERIOD_MS[period]).toISOString();
    try {
      const { logs: newLogs, nextCursor: cursor } = await fetchLogs({
        before: nextCursor,
        since: date,
        level: levels,
        service: service ?? undefined,
        search: debouncedSearch,
      });
      setLogs((prev) => [...prev, ...newLogs]);
      setNextCursor(cursor);
    } catch (err) {
      console.error("Не удалось загрузить логи", err);
    }
  }

  useEffect(() => {
    const since = new Date(Date.now() - PERIOD_MS[period]).toISOString();
    runQuery(() => fetchTopErrors(since), setTopStatus, setTopErrors);
  }, [period]);

  useEffect(() => {
    const hoursBack = PERIOD_MS[period] / (60 * 60 * 1000);
    runQuery(
      () => fetchErrorsOverTime(hoursBack),
      setChartStatus,
      setErrorPoints,
    );
  }, [period]);

  useEffect(() => {
    let es: EventSource | null = null;

    async function loadLogs() {
      const date = new Date(Date.now() - PERIOD_MS[period]).toISOString();
      setLogs([]);
      setNextCursor(null);
      try {
        const data = await fetchLogs({
          since: date,
          level: levels,
          service: service ?? undefined,
          search: debouncedSearch,
        });
        setLogs(data.logs);
        setNextCursor(data.nextCursor);
        if (data.logs.length > 0) {
          es = subscribeToLogs(
            Number(data.logs[0].id),
            (newLogs) => {
              setLogs((prev) => {
                const fresh = newLogs.filter(
                  (n) => !prev.some((p) => p.id === n.id),
                );
                return [...fresh, ...prev];
              });
            },
            {
              level: levels,
              service: service ?? undefined,
              search: debouncedSearch,
            },
          );
        }
      } catch (err) {
        console.error("Не удалось загрузить логи:", err);
      }
    }
    loadLogs();
    return () => {
      es?.close();
    };
  }, [period, levels, service, debouncedSearch]);

  useEffect(() => {
    const since = new Date(Date.now() - PERIOD_MS[period]).toISOString();
    runQuery(() => fetchSummary(since), setSummaryStatus, setSummary);
  }, [period]);

  useEffect(() => {
    async function loadServices() {
      const since = new Date(Date.now() - PERIOD_MS[period]).toISOString();
      try {
        const data = await fetchServices(since);
        setServices(data);
        if (service !== null && !data.includes(service)) {
          setService(null);
        }
      } catch (err) {
        console.error("Не удалось загрузить сервисы", err);
      }
    }
    loadServices();
  }, [period]);

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

            <StatCard summary={summary} status={summaryStatus} />

            <section className={s.charts}>
              <ErrorsChart points={errorPoints} status={chartStatus} />
              <TopErrors errors={topErrors} status={topStatus} />
            </section>

            <LogStream
              logs={logs}
              levels={levels}
              service={service}
              services={services}
              onLevelsChange={setLevels}
              onServiceChange={setService}
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
