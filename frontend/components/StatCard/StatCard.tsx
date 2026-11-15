import { Icon } from "../Icon/Icon";
import s from "./StatCard.module.css";

interface StatCardProps {
  summary: { total: number; errors: number; warns: number };
}

export function StatCard({summary}: StatCardProps) {

  const cards = [
    {label: "Total logs", value: summary.total, tone: "cyan", icon: "activity"},
    {label: "Errors", value: summary.errors, tone: "rose", icon: "alert"},
    {label: "Warns", value: summary.warns, tone: "amber", icon: "activity"},
  ] as const;

  return (
    <section className={s.grid}>
      {cards.map((card) => (
        <article key={card.label} className={s.card} data-tone={card.tone}>
          <div className={s.head}>
            <p className={s.label}>{card.label}</p>
            <div className={s.iconWrap}>
              <Icon name={card.icon} />
            </div>
          </div>
          <p className={s.value}>{card.value}</p>
        </article>
      ))}
    </section>
  );
}
