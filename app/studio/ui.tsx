"use client";

import type { ReactNode } from "react";

export function Label({ children }: { children: ReactNode }) {
  return <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-2">{children}</div>;
}

export function Slider({
  label,
  value,
  min,
  max,
  step = 1,
  onChange,
  read,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (n: number) => void;
  read?: string;
}) {
  return (
    <label className="block select-none">
      <div className="flex items-baseline justify-between">
        <Label>{label}</Label>
        <span className="font-mono text-[11px] text-ink">{read ?? value}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="mt-2 h-1 w-full cursor-pointer appearance-none rounded-full bg-ink/15 accent-ink"
      />
    </label>
  );
}

export function Seg<T extends string>({
  value,
  options,
  onChange,
}: {
  value: T;
  options: { v: T; l: string }[];
  onChange: (v: T) => void;
}) {
  return (
    <div className="flex gap-1 rounded-lg border border-ink/15 bg-white/40 p-1">
      {options.map((o) => (
        <button
          key={o.v}
          type="button"
          onClick={() => onChange(o.v)}
          className={`flex-1 rounded-md px-2 py-1.5 font-mono text-[10px] uppercase tracking-[0.12em] transition-colors ${
            value === o.v ? "bg-ink text-bone" : "text-ink-2 hover:bg-ink/5"
          }`}
        >
          {o.l}
        </button>
      ))}
    </div>
  );
}

export function Btn({
  children,
  onClick,
  kind = "ghost",
  disabled,
  full,
}: {
  children: ReactNode;
  onClick?: () => void;
  kind?: "solid" | "ghost" | "flame";
  disabled?: boolean;
  full?: boolean;
}) {
  const base = "rounded-lg px-3 py-2 font-mono text-[11px] uppercase tracking-[0.14em] transition-colors disabled:opacity-40";
  const style =
    kind === "solid"
      ? "bg-ink text-bone hover:bg-ink/90"
      : kind === "flame"
        ? "bg-flame text-[#1A0F02] hover:bg-flame/90"
        : "border border-ink/20 text-ink hover:bg-ink/5";
  return (
    <button type="button" onClick={onClick} disabled={disabled} className={`${base} ${style} ${full ? "w-full" : ""}`}>
      {children}
    </button>
  );
}

export function Note({ children }: { children: ReactNode }) {
  return <p className="font-mono text-[10px] leading-relaxed text-ink-2/80">{children}</p>;
}
