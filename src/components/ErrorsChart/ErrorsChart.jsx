import { useId } from "react";
import s from "./ErrorsChart.module.css";

const AREA_FILL =
  "M0 174 L45 159 L90 166 L135 128 L180 146 L225 83 L270 121 L315 111 L360 136 L405 72 L450 92 L495 42 L540 80 L585 68 L630 99 L675 55 L720 73 L720 210 L0 210Z";

const AREA_LINE =
  "M0 174 L45 159 L90 166 L135 128 L180 146 L225 83 L270 121 L315 111 L360 136 L405 72 L450 92 L495 42 L540 80 L585 68 L630 99 L675 55 L720 73";

const TIMES = ["00:00", "04:00", "08:00", "12:00", "16:00", "20:00", "Now"];

export function ErrorsChart() {
  const gradientId = useId();

  return (
    <div className={`${s.panel} ${s.wide}`}>
      <div className={s.head}>
        <div>
          <p className={s.title}>Errors over time</p>
          <p className={s.subtitle}>Error volume in the last 24 hours</p>
        </div>
        <div className={s.legend}>
          <span className={s.legendDot} />
          Errors
        </div>
      </div>

      <div className={s.body}>
        <div className={s.axis}>
          <span>24</span>
          <span>18</span>
          <span>12</span>
          <span>6</span>
          <span>0</span>
        </div>

        <div className={s.plot}>
          <div className={`${s.gridLine} ${s.line0}`} />
          <div className={`${s.gridLine} ${s.line25}`} />
          <div className={`${s.gridLine} ${s.line50}`} />
          <div className={`${s.gridLine} ${s.line75}`} />
          <div className={`${s.gridLine} ${s.lineBottom}`} />

          <div className={s.area}>
            <svg className={s.svg} viewBox="0 0 720 210" preserveAspectRatio="none">
              <defs>
                <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="currentColor" stopOpacity=".28" />
                  <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
                </linearGradient>
              </defs>
              <path d={AREA_FILL} fill={`url(#${gradientId})`} />
              <path
                d={AREA_LINE}
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                vectorEffect="non-scaling-stroke"
              />
            </svg>
          </div>

          <div className={s.labels}>
            {TIMES.map((t) => (
              <span key={t}>{t}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}