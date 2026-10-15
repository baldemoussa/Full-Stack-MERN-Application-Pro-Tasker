// The status pie chart and the 14-day trend line.
import type { TrendPoint } from "../utils/projectAnalytics";

export interface PieSlice {
  label: string;
  count: number;
  color: string;
}

function piePath(start: number, end: number) {
  const radius = 42;
  const x1 = 50 + radius * Math.cos(start);
  const y1 = 50 + radius * Math.sin(start);
  const x2 = 50 + radius * Math.cos(end);
  const y2 = 50 + radius * Math.sin(end);
  const large = end - start > Math.PI ? 1 : 0;
  return `M 50 50 L ${x1} ${y1} A ${radius} ${radius} 0 ${large} 1 ${x2} ${y2} Z`;
}

export function StatusPie({ slices }: { slices: PieSlice[] }) {
  const total = slices.reduce((sum, slice) => sum + slice.count, 0);
  const filled = slices.filter((slice) => slice.count > 0);
  let angle = -Math.PI / 2;
  const summary = filled.map((slice) => `${slice.label} ${slice.count}`).join(", ") || "No tasks";

  return (
    <svg viewBox="0 0 100 100" className="h-44 w-44 shrink-0" role="img" aria-label={`Status pie chart. ${summary}.`}>
      {total === 0 ? (
        <circle cx="50" cy="50" r="42" className="fill-stone-200 dark:fill-stone-700" />
      ) : filled.length === 1 ? (
        <circle cx="50" cy="50" r="42" fill={filled[0].color} />
      ) : (
        filled.map((slice) => {
          const sweep = (slice.count / total) * Math.PI * 2;
          const start = angle;
          angle += sweep;
          return <path key={slice.label} d={piePath(start, angle)} fill={slice.color} />;
        })
      )}
    </svg>
  );
}

export function TrendLine({ points }: { points: TrendPoint[] }) {
  const width = 320;
  const height = 160;
  const left = 28;
  const right = 12;
  const top = 16;
  const bottom = 28;
  const max = Math.max(...points.map((point) => point.total), 1);
  const innerWidth = width - left - right;
  const innerHeight = height - top - bottom;
  const coords = points.map((point, index) => {
    const x = left + (points.length === 1 ? innerWidth / 2 : (index / (points.length - 1)) * innerWidth);
    const y = top + innerHeight - (point.total / max) * innerHeight;
    return { ...point, x, y };
  });
  const line = coords.map((point) => `${point.x},${point.y}`).join(" ");
  const latest = points[points.length - 1]?.total ?? 0;
  const labels = [coords[0], coords[Math.floor((coords.length - 1) / 2)], coords[coords.length - 1]].filter(
    (point, index, list) => list.findIndex((item) => item.date === point.date) === index,
  );

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="h-44 w-full" role="img" aria-label={`Tasks added over the last 14 days. The latest total is ${latest}.`}>
      <line x1={left} y1={top} x2={left} y2={top + innerHeight} className="stroke-stone-300 dark:stroke-stone-600" strokeWidth="1" />
      <line x1={left} y1={top + innerHeight} x2={width - right} y2={top + innerHeight} className="stroke-stone-300 dark:stroke-stone-600" strokeWidth="1" />
      <text x={4} y={top + 4} className="fill-stone-500 text-[10px]">{max}</text>
      <text x={4} y={top + innerHeight} className="fill-stone-500 text-[10px]">0</text>
      <polyline points={line} fill="none" stroke="#0f766e" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
      {coords.map((point) => (
        <circle key={point.date} cx={point.x} cy={point.y} r="2.5" fill="#0f766e">
          <title>{`${point.label}: ${point.total}`}</title>
        </circle>
      ))}
      {labels.map((point) => (
        <text key={point.date} x={point.x} y={height - 8} textAnchor="middle" className="fill-stone-500 text-[10px]">
          {point.label}
        </text>
      ))}
    </svg>
  );
}
