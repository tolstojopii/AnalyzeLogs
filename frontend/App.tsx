import { useEffect, useState } from "react";
import { Sidebar } from "./components/Sidebar/Sidebar";
import { Header } from "./components/Header/Header";
import { StatCard } from "./components/StatCard/StatCard";
import { ErrorsChart } from "./components/ErrorsChart/ErrorsChart";
import { TopErrors } from "./components/TopErrors/TopErrors";
import { LogStream } from "./components/LogStream/LogStream";
import { Toast } from "./components/Toast/Toast";
import { type Period, type LogEntry, ErrorPoint, TopError } from "./data/data";
import s from "./App.module.css";
import { LogDetails } from "./components/LogDetails/LogDetails";
import { useEscapeKey } from "./hooks/useEscapeKey";
import { fetchErrorsOverTime, fetchLogs, fetchTopErrors } from "./api/logs";

export default function App() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [period, setPeriod] = useState<Period>("24h");
  const [toast, setToast] = useState<string | null>(null);
  const [selectedLog, setSelectedLog] = useState<LogEntry | null>(null);
  const [errorPoints, setErrorPoints] = useState<ErrorPoint[]>([])
  const [topErrors, setTopErrors] = useState<TopError[]>([])

  const handleResetAppFilters = () => {
    setSearchQuery("");
    setPeriod("24h");
  };

  useEffect(()=>{
    async function load() {
      try{
        const data = await fetchErrorsOverTime();
        setErrorPoints(data)
      }catch(err){
        console.error("Не удалось загрузить точки графика:", err);
      }
    }
    load();
  }, [])

  useEffect(() => {
    console.log("useEffect СТАРТОВАЛ");
    async function load() {
      try {
        const data = await fetchLogs();
        console.log("пришло из fetchlogs:", data);
        setLogs(data);
      } catch (err) {
        console.error("Не удалось загрузить логи:", err);
      }
    }
    load();
  }, []);

  useEffect(()=>{
    async function load() {
      try{
        const data = await fetchTopErrors();
        setTopErrors(data)
      }catch(err){
        console.error("Не удалось загрузить топ ошибок:", err);
      }
    }
    load();
  }, [])

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
              <ErrorsChart points={errorPoints}/>
              <TopErrors errors={topErrors}/>
            </section>

            <LogStream
              logs={logs}
              searchQuery={searchQuery}
              period={period}
              onCopyTrace={setToast}
              onSelectLog={setSelectedLog}
              onResetAppFilters={handleResetAppFilters}
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
