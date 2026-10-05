import s from "./Sidebar.module.css";
import { Icon } from "./../Icon/Icon";
import { cx } from "./../../utils/cx";

export function Sidebar() {
  return (
    <aside className={s.sidebar}>
      <div className={s.board}>
        <div className={s.brandMark}>
          <Icon name="activity" size={20} />
        </div>
        <div>
          <p className={s.brandTitle}>SignalStack</p>
          <p className={s.brandSubtitle}>Log intelligence</p>
        </div>
      </div>

      <nav className={s.nav}>
        <a className={cx(s.navItem, s.navItemActive)} href="#overview">
          <Icon name="dashboard" />
          Overview
        </a>
        <a className={s.navItem} href="#logs">
          <Icon name="logs" />
          Log explorer
          <span className={s.kbd}>⌘K</span>
        </a>
        <a className={s.navItem} href="#alerts">
          <Icon name="alert" />
          Alerts
          <span className={s.badge}>4</span>
        </a>
      </nav>

      <p className={s.sectionLabel}>Workspace</p>

      <nav className={cx(s.nav, s.navSecondary)}>
        <a className={s.navItem} href="#saved">
          <Icon name="spark" />
          Saved views
        </a>
        <a className={s.navItem} href="#settings">
          <Icon name="settings" />
          Settings
        </a>
      </nav>

      <div className={s.usage}>
        <div className={s.usageRow}>
          <span className={s.usageLabel}>Data usage</span>
          <span className={s.usageValue}>64.2 GB</span>
        </div>
        <div className={s.usageTrack}>
          <div className={s.usageFill} />
        </div>
        <p className={s.usageHint}>Resets in 12 days · 100 GB plan</p>
      </div>
    </aside>
  );
}
