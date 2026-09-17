"use client";

import { useEffect, useRef, useState } from "react";

export type TrendDatum = {
  label: string; // "S3"
  fullLabel: string; // "Session 3 · 12 Mar 2026"
  pct: number;
  present: number;
  recorded: number;
};

const H = 210;
const PAD = { top: 20, right: 18, bottom: 28, left: 34 };
const PLOT_H = H - PAD.top - PAD.bottom;

/**
 * One series, so no legend — the card title names it. The plot is measured
 * rather than scaled, so it keeps a fixed height on a wide screen instead of
 * growing with the container. Hover gives a crosshair and the exact numbers;
 * the sr-only table carries the same values for anyone who can't read the plot.
 */
export default function AttendanceTrend({ data }: { data: TrendDatum[] }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(640);
  const [hover, setHover] = useState<number | null>(null);

  useEffect(() => {
    const element = wrapRef.current;
    if (!element) return;
    const observer = new ResizeObserver(([entry]) =>
      setWidth(Math.max(280, Math.round(entry.contentRect.width))),
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  const plotW = width - PAD.left - PAD.right;
  const x = (i: number) =>
    PAD.left + (data.length === 1 ? plotW / 2 : (i / (data.length - 1)) * plotW);
  const y = (pct: number) => PAD.top + PLOT_H - (pct / 100) * PLOT_H;

  const line = data.map((d, i) => `${x(i)},${y(d.pct)}`).join(" ");
  const area = `${PAD.left},${y(0)} ${line} ${x(data.length - 1)},${y(0)}`;

  const last = data[data.length - 1];
  // Keep the direct label inside the plot when the line is near the ceiling.
  const lastLabelY =
    y(last.pct) - 10 < PAD.top ? y(last.pct) + 20 : y(last.pct) - 10;

  function onMove(event: React.PointerEvent<SVGSVGElement>) {
    const rect = event.currentTarget.getBoundingClientRect();
    const pointerX = event.clientX - rect.left;
    let nearest = 0;
    let best = Infinity;
    data.forEach((_, i) => {
      const dist = Math.abs(x(i) - pointerX);
      if (dist < best) {
        best = dist;
        nearest = i;
      }
    });
    setHover(nearest);
  }

  const active = hover === null ? null : data[hover];
  // Keep the tooltip inside the card at either end.
  const tipX = hover === null ? 0 : x(hover);
  const tipShift =
    tipX < width * 0.22 ? "0%" : tipX > width * 0.78 ? "-100%" : "-50%";

  return (
    <div className="relative" ref={wrapRef}>
      <svg
        width={width}
        height={H}
        viewBox={`0 0 ${width} ${H}`}
        className="block max-w-full touch-none"
        role="img"
        aria-label={`Attendance by session, from ${data[0].pct}% at ${data[0].fullLabel} to ${last.pct}% at ${last.fullLabel}.`}
        onPointerMove={onMove}
        onPointerLeave={() => setHover(null)}
      >
        {[0, 25, 50, 75, 100].map((tick) => (
          <g key={tick}>
            <line
              x1={PAD.left}
              x2={width - PAD.right}
              y1={y(tick)}
              y2={y(tick)}
              stroke="var(--line)"
              strokeWidth={1}
            />
            <text
              x={PAD.left - 8}
              y={y(tick) + 4}
              textAnchor="end"
              fontSize={11}
              fill="var(--ink-muted)"
            >
              {tick}
            </text>
          </g>
        ))}

        <polygon points={area} fill="var(--accent)" opacity={0.08} />
        <polyline
          points={line}
          fill="none"
          stroke="var(--accent)"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {hover !== null && (
          <line
            x1={x(hover)}
            x2={x(hover)}
            y1={PAD.top}
            y2={PAD.top + PLOT_H}
            stroke="var(--ink-muted)"
            strokeWidth={1}
            strokeDasharray="3 3"
          />
        )}

        {data.map((d, i) => (
          <g key={d.label}>
            {/* Hit target wider than the mark. */}
            <rect
              x={x(i) - 16}
              y={PAD.top}
              width={32}
              height={PLOT_H}
              fill="transparent"
            />
            <circle
              cx={x(i)}
              cy={y(d.pct)}
              r={hover === i ? 6 : 4.5}
              fill="var(--accent)"
              stroke="var(--card)"
              strokeWidth={2}
            />
            <text
              x={x(i)}
              y={H - 8}
              textAnchor="middle"
              fontSize={11}
              fill="var(--ink-muted)"
            >
              {d.label}
            </text>
          </g>
        ))}

        {/* Only the latest point is labelled directly — not every value. */}
        {hover === null && (
          <text
            x={x(data.length - 1) - 4}
            y={lastLabelY}
            textAnchor="end"
            fontSize={12}
            fontWeight={600}
            fill="var(--ink)"
            stroke="var(--card)"
            strokeWidth={3}
            paintOrder="stroke"
          >
            {last.pct}%
          </text>
        )}
      </svg>

      {active && (
        <div
          className="pointer-events-none absolute top-0 z-10 rounded-lg border border-line bg-white px-3 py-2 text-xs shadow-sm"
          style={{ left: `${tipX}px`, transform: `translateX(${tipShift})` }}
        >
          <p className="font-medium text-navy">{active.fullLabel}</p>
          <p className="mt-0.5 text-ink-soft">
            {active.pct}% · {active.present} of {active.recorded} present
          </p>
        </div>
      )}

      {/* Same values in text, for screen readers. The wrapper does the
          hiding: a bare table ignores sr-only's 1px width. */}
      <div className="sr-only">
        <table>
          <caption>Attendance by session</caption>
          <thead>
            <tr>
              <th scope="col">Session</th>
              <th scope="col">Attendance</th>
              <th scope="col">Present</th>
            </tr>
          </thead>
          <tbody>
            {data.map((d) => (
              <tr key={d.label}>
                <th scope="row">{d.fullLabel}</th>
                <td>{d.pct}%</td>
                <td>
                  {d.present} of {d.recorded}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
