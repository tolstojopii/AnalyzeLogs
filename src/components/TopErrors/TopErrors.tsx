import { topErrors } from "../../data/data";
import s from "./TopErrors.module.css";

export function TopErrors() {
  return (
    <div className={s.panel}>
      <div className={s.head}>
        <div>
          <p className={s.title}>Top 5 errors</p>
          <p className={s.subtitle}>Most frequent in 24 hours</p>
        </div>
        <p className={s.total}>94 total</p>
      </div>
      <div className={s.list}>
        {topErrors.map((error, index) => (
          <div key={error.label} className={s.item}>
            <span className={s.index}>{String(index + 1).padStart(2, "0")}</span>
            <div className={s.body}>
              <div className={s.row}>
                <p className={s.label}>{error.label}</p>
                <span className={s.count}>{error.count}</span>
              </div>
              <p className={s.service}>{error.service}</p>
              <div className={s.track}>
                <div className={s.fill} style={{ width: `${error.width}%` }} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

