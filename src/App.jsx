import { useEffect, useState } from "react";
import { Sidebar } from "./components/Sidebar/Sidebar";
import { Header } from "./components/Header/Header";
import { StatCard } from "./components/StatCard/StatCard";
import { ErrorsChart } from "./components/ErrorsChart/ErrorsChart";
import { TopErrors } from "./components/TopErrors/TopErrors";
import { LogStream } from "./components/LogStream/LogStream";
import { Icon } from "./components/Icon/Icon";
import { initialLogs, incomingLogs } from "./data/data";
import s from "./App.module.css";

export default function App() {
  const [logs, setLogs] = useState(initialLogs);

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




  return (
    <div className={s.page}>
      <div className={s.shell}>
        <Sidebar />

        <main className={s.main}>
          <Header />

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
                <div className={s.period}>
                  Last 24 hours
                  <Icon name="chevron" size={12} className="rotate" />
                </div>
                <button
                  type="button"
                  className={s.iconButton}
                  aria-label="Download"
                >
                  <Icon name="download" />
                </button>
              </div>
            </div>

            <StatCard />

            <section className={s.charts}>
              <ErrorsChart />
              <TopErrors />
            </section>

            <LogStream logs={logs} />
          </div>
        </main>
      </div>
    </div>
  );
}
