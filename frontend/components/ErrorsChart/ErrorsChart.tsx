import { useId } from "react";
import { errorsOverTime, type ErrorPoint } from "../../data/data";
import s from "./ErrorsChart.module.css";

const WIDTH = 720;
const HEIGHT = 210;

interface Point {
  x: number;
  y: number;
}

function buildPoints(data: ErrorPoint[]): Point[] {
  const maxErrors = Math.max(...data.map((p) => p.errors));
  return data.map((point, i) => ({
    x: (i / (data.length - 1)) * WIDTH,
    y: HEIGHT - (point.errors / maxErrors) * HEIGHT,
  }));
}

function buildLinePath(points: Point[]): string {
  return points
    .map((p, i) => `${i === 0 ? "M" : "L"}${p.x} ${p.y}`)
    .join(" ");
}

export function ErrorsChart() {
  const gradientId = useId();

  const maxErrors = Math.max(...errorsOverTime.map((p) => p.errors));
  const points = buildPoints(errorsOverTime);
  const linePath = buildLinePath(points);
  const areaPath = `${linePath} L${WIDTH} ${HEIGHT} L0 ${HEIGHT} Z`;

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
          <span>{maxErrors}</span>
          <span>{Math.round(maxErrors * 0.75)}</span>
          <span>{Math.round(maxErrors * 0.5)}</span>
          <span>{Math.round(maxErrors * 0.25)}</span>
          <span>0</span>
        </div>

        <div className={s.plot}>
          <div className={`${s.gridLine} ${s.line0}`} />
          <div className={`${s.gridLine} ${s.line25}`} />
          <div className={`${s.gridLine} ${s.line50}`} />
          <div className={`${s.gridLine} ${s.line75}`} />
          <div className={`${s.gridLine} ${s.lineBottom}`} />

          <div className={s.area}>
            <svg className={s.svg} viewBox={`0 0 ${WIDTH} ${HEIGHT}`} preserveAspectRatio="none">
              <defs>
                <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="currentColor" stopOpacity=".28" />
                  <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
                </linearGradient>
              </defs>

              <path d={areaPath} fill={`url(#${gradientId})`} />
              <path
                d={linePath}
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                vectorEffect="non-scaling-stroke"
              />
            </svg>
          </div>

          <div className={s.labels}>
            {errorsOverTime.map((point) => (
              <span key={point.hour}>{point.hour}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}