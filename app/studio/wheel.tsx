"use client";

import { useState } from "react";
import { TOOLS } from "@/lib/tools";
import type { ToolId } from "@/lib/types";

const C = 200;
const RO = 172;
const RI = 98;
const GAP = 3;

const rad = (d: number) => (d * Math.PI) / 180;
const pt = (r: number, d: number): [number, number] => [C + r * Math.cos(rad(d)), C + r * Math.sin(rad(d))];

function sector(i: number) {
  const c = -90 + i * 60;
  const s = c - 30 + GAP;
  const e = c + 30 - GAP;
  const [x1, y1] = pt(RO, s);
  const [x2, y2] = pt(RO, e);
  const [x3, y3] = pt(RI, e);
  const [x4, y4] = pt(RI, s);
  return `M${x1} ${y1}A${RO} ${RO} 0 0 1 ${x2} ${y2}L${x3} ${y3}A${RI} ${RI} 0 0 0 ${x4} ${y4}Z`;
}

function icon(id: ToolId, on: boolean) {
  const stroke = on ? "#F1ECE2" : "#15130F";
  const p = { fill: "none", stroke, strokeWidth: 1.6, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  switch (id) {
    case "convert":
      return (
        <g {...p}>
          <path d="M5 -3a7 7 0 0 0-12 2" />
          <path d="M-7 -6v5h5" />
          <path d="M-5 3a7 7 0 0 0 12-2" />
          <path d="M7 6v-5h-5" />
        </g>
      );
    case "compress":
      return (
        <g {...p}>
          <path d="M0 -8v5M0 -3l-3-3M0 -3l3-3" />
          <path d="M0 8v-5M0 3l-3 3M0 3l3 3" />
          <path d="M-6 0h12" opacity={0.45} />
        </g>
      );
    case "resize":
      return (
        <g {...p}>
          <path d="M-8 -4v-4h4M8 4v4h-4" />
          <path d="M-8 8h4M8 -8h-4" opacity={0.45} />
          <path d="M-4 4l8-8" />
        </g>
      );
    case "rotate":
      return (
        <g {...p}>
          <path d="M6.5 0a6.5 6.5 0 1 1-2.2-4.9" />
          <path d="M6.5 -6v5.2h-5" />
        </g>
      );
    case "crop":
      return (
        <g {...p}>
          <path d="M-6 -9v13a2 2 0 0 0 2 2h13" />
          <path d="M-9 -6h13a2 2 0 0 1 2 2v13" />
        </g>
      );
    case "frames":
      return (
        <g {...p}>
          <rect x={-8} y={-6} width={16} height={12} rx={1.5} />
          <path d="M-4 -6v12M4 -6v12" opacity={0.5} />
          <path d="M-8 0h16" opacity={0.5} />
        </g>
      );
  }
}

export default function Wheel({ onPick }: { onPick: (t: ToolId) => void }) {
  const [hit, setHit] = useState<number | null>(null);

  const idx = (e: React.PointerEvent<HTMLDivElement> | React.MouseEvent<HTMLDivElement>) => {
    const el = e.currentTarget.getBoundingClientRect();
    const cx = el.width / 2;
    const cy = el.height / 2;
    const dx = e.clientX - el.left - cx;
    const dy = e.clientY - el.top - cy;
    const d = Math.hypot(dx, dy) / (el.width / 400);
    if (d < RI - 6 || d > RO + 16) return null;
    const a = ((Math.atan2(dy, dx) * 180) / Math.PI + 360) % 360;
    return Math.floor((((a - 270 + 360) % 360) + 30) / 60) % 6;
  };

  return (
    <div
      className="wheel-in relative aspect-square w-[min(90vw,552px)] max-h-[76vh]"
      onPointerDown={(e) => setHit(idx(e))}
      onPointerMove={(e) => setHit(idx(e))}
      onPointerLeave={() => setHit(null)}
      onClick={(e) => {
        const i = idx(e);
        if (i !== null) onPick(TOOLS[i].id);
      }}
    >
      <svg viewBox="0 0 400 400" className="absolute inset-0 h-full w-full">
        <circle cx={C} cy={C} r={RO + 10} fill="none" stroke="rgba(21,19,15,0.1)" strokeDasharray="1 7" />
        {TOOLS.map((t, i) => {
          const on = hit === i;
          const c = -90 + i * 60;
          return (
            <g key={t.id} style={{ animationDelay: `${i * 30}ms` }} className="sector-in">
              <title>{`${t.name} — ${t.hint}`}</title>
              <path
                d={sector(i)}
                fill={on ? "#15130F" : "rgba(250,247,240,0.42)"}
                stroke={on ? "#15130F" : "rgba(21,19,15,0.3)"}
                strokeWidth={1}
                style={{ transition: "fill 140ms ease, stroke 140ms ease" }}
              />
              <g transform={`translate(${pt(157, c)[0]} ${pt(157, c)[1]}) scale(0.86)`}>{icon(t.id, on)}</g>
              <text
                x={pt(128, c)[0]}
                y={pt(128, c)[1]}
                textAnchor="middle"
                dominantBaseline="middle"
                fill={on ? "#F1ECE2" : "#57503F"}
                style={{ font: "600 9px ui-monospace, SFMono-Regular, Menlo, monospace", letterSpacing: "0.12em" }}
              >
                {t.name}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
