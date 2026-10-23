"use client";

import { useId } from "react";
import { cn } from "@/lib/utils";

/** Lightweight dependency-free charts (SVG / CSS) tuned for the admin panel. */

export function BarChart({
  data,
  color = "#4c2fd0",
  height = 180,
}: {
  data: { label: string; value: number }[];
  color?: string;
  height?: number;
}) {
  const max = Math.max(1, ...data.map((d) => d.value));
  return (
    <div className="flex items-end gap-2" style={{ height }}>
      {data.map((d) => (
        <div key={d.label} className="group flex flex-1 flex-col items-center justify-end gap-1">
          <span className="text-[10px] font-semibold text-[rgb(var(--text-muted))] opacity-0 transition-opacity group-hover:opacity-100">
            {d.value}
          </span>
          <div
            className="w-full rounded-t-md transition-all hover:opacity-80"
            style={{ height: `${(d.value / max) * (height - 40)}px`, backgroundColor: color }}
          />
          <span className="w-full truncate text-center text-[10px] text-[rgb(var(--text-muted))]">{d.label}</span>
        </div>
      ))}
    </div>
  );
}

export function AreaChart({
  data,
  color = "#4c2fd0",
  height = 200,
}: {
  data: { label: string; value: number }[];
  color?: string;
  height?: number;
}) {
  const id = useId().replace(/:/g, "");
  const w = 600;
  const h = height;
  const pad = 8;
  const max = Math.max(...data.map((d) => d.value));
  const min = Math.min(...data.map((d) => d.value));
  const range = max - min || 1;
  const step = (w - pad * 2) / Math.max(1, data.length - 1);
  const points = data.map((d, i) => {
    const x = pad + i * step;
    const y = pad + (1 - (d.value - min) / range) * (h - pad * 2 - 20);
    return [x, y] as const;
  });
  const line = points.map(([x, y], i) => `${i === 0 ? "M" : "L"}${x},${y}`).join(" ");
  const area = `${line} L${points[points.length - 1][0]},${h - 20} L${points[0][0]},${h - 20} Z`;

  return (
    <div>
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full" style={{ height }} preserveAspectRatio="none">
        <defs>
          <linearGradient id={`grad-${id}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.35" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={area} fill={`url(#grad-${id})`} />
        <path d={line} fill="none" stroke={color} strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
        {points.map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r="2.5" fill={color} />
        ))}
      </svg>
      <div className="mt-1 flex justify-between text-[10px] text-[rgb(var(--text-muted))]">
        {data.map((d, i) => (
          <span key={d.label} className={cn(i % 2 === 1 && "hidden sm:inline")}>{d.label}</span>
        ))}
      </div>
    </div>
  );
}

export function DonutChart({
  data,
  size = 180,
}: {
  data: { label: string; value: number; color: string }[];
  size?: number;
}) {
  const total = data.reduce((s, d) => s + d.value, 0) || 1;
  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  let offset = 0;

  return (
    <div className="flex flex-wrap items-center gap-6">
      <svg width={size} height={size} viewBox="0 0 160 160" className="-rotate-90">
        {data.map((d) => {
          const len = (d.value / total) * circumference;
          const el = (
            <circle
              key={d.label}
              cx="80"
              cy="80"
              r={radius}
              fill="none"
              stroke={d.color}
              strokeWidth="22"
              strokeDasharray={`${len} ${circumference - len}`}
              strokeDashoffset={-offset}
            />
          );
          offset += len;
          return el;
        })}
      </svg>
      <ul className="space-y-1.5 text-sm">
        {data.map((d) => (
          <li key={d.label} className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full" style={{ background: d.color }} />
            <span className="text-[rgb(var(--text-muted))]">{d.label}</span>
            <span className="ml-auto font-semibold">{Math.round((d.value / total) * 100)}%</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Horizontal ranked bars for breakdowns (top pages, sources, devices…). */
export function RankedBars({
  data,
  color = "#4c2fd0",
  unit = "views",
}: {
  data: { label: string; value: number }[];
  color?: string;
  unit?: string;
}) {
  const max = Math.max(1, ...data.map((d) => d.value));
  if (data.length === 0) {
    return <p className="py-6 text-center text-sm text-[rgb(var(--text-muted))]">No data yet.</p>;
  }
  return (
    <ul className="space-y-3">
      {data.map((d) => (
        <li key={d.label}>
          <div className="mb-1 flex items-center justify-between gap-3 text-sm">
            <span className="truncate">{d.label}</span>
            <span className="shrink-0 font-semibold tabular-nums">
              {d.value.toLocaleString("en-US")}
              <span className="ml-1 font-normal text-[rgb(var(--text-muted))]">{unit}</span>
            </span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-[rgb(var(--bg-subtle))]">
            <div
              className="h-full rounded-full transition-all"
              style={{ width: `${(d.value / max) * 100}%`, backgroundColor: color }}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}
