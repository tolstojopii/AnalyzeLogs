import { Icon } from "../Icon/Icon"
import { statCards } from "../../data/data";
import { cx } from "../../utils/cx";
import s from "./StatCard.module.css";

export function StatCard(){
  return(
    <section className={s.grid}>
      {statCards.map((card) => (
        <article key={card.label} className={s.card} data-tone={card.tone}>
          <div className={s.head}>
            <p className={s.label}>{card.label}</p>
            <div className={s.iconWrap}>
              <Icon name={card.icon} />
            </div>
          </div>
          <p className={s.value}>{card.value}</p>
          <p className={cx(s.meta, card.metaTone === "danger" && s.metaDanger)}>
            {card.meta}
          </p>
        </article>
      ))}
    </section>
  )
}