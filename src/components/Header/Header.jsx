import { Icon } from "./../Icon/Icon";
import s from "./Header.module.css";

export function Header() {
  return (
    <header className={s.header}>
      <div className={s.inner}>
        <div className={s.mobileBrand}>
          <div className={s.mobileBrandMark}>
            <Icon name="activity" size={20} />
          </div>
          <p className={s.mobileBrandName}>Signalstack</p>
        </div>

        <div className={s.breadcrumb}>
          <span>Production</span>
          <Icon name="chevron" size={12} />
          <span className={s.breadcrumbCurrent}>Overview</span>
        </div>

        <div className={s.actions}>
          <input
            type="text"
            className={s.search}
            placeholder="Search logs"
          ></input>

          <button type="button" className={s.iconButton} aria-label="Settings">
            <Icon name="settings" />
          </button>

          <div className={s.avatar}>MN</div>
        </div>
      </div>
    </header>
  );
}
