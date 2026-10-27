"use client";

import { fmtSize } from "@/lib/img";
import type { Res, Src } from "@/lib/types";
import { Btn } from "./ui";

const delta = (a: number, b: number) => Math.round(((b - a) / a) * 100);

export function FileCard({ src }: { src: Src }) {
  return (
    <div className="w-[clamp(112px,32vw,172px)] rounded-xl border border-ink/15 bg-[#FAF7F0]/85 p-2 shadow-[0_18px_40px_-18px_rgba(21,19,15,0.45)] backdrop-blur-sm">
      <div className="grid place-items-center overflow-hidden rounded-lg bg-white/60">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src.url} alt="" className="max-h-[132px] w-full object-contain" />
      </div>
      <div className="mt-2 truncate px-0.5 font-mono text-[10px] text-ink">{src.file.name}</div>
      <div className="px-0.5 pb-0.5 font-mono text-[9px] text-ink-2">
        {src.w}×{src.h} · {fmtSize(src.size)}
      </div>
    </div>
  );
}

export function ResultCard({
  res,
  from,
  onKeep,
  onNew,
}: {
  res: Res;
  from: number;
  onKeep: () => void;
  onNew: () => void;
}) {
  const d = delta(from, res.blob.size);
  return (
    <div className="w-[min(86vw,360px)] rounded-2xl border border-ink/15 bg-[#FAF7F0]/90 p-3 shadow-[0_24px_60px_-24px_rgba(21,19,15,0.5)] backdrop-blur">
      <div className="checker grid place-items-center overflow-hidden rounded-xl bg-white/60">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={res.url} alt="" className="max-h-[38vh] max-w-full object-contain" />
      </div>
      <div className="mt-3 flex items-baseline justify-between gap-3 px-1">
        <span className="truncate font-mono text-[11px] text-ink">{res.name}</span>
        <span className={`shrink-0 font-mono text-[10px] ${d < 0 ? "text-emerald-800" : "text-ink-2"}`}>
          {fmtSize(from)} → {fmtSize(res.blob.size)} {d !== 0 ? `(${d > 0 ? "+" : ""}${d}%)` : ""}
        </span>
      </div>
      <div className="mt-1 px-1 font-mono text-[10px] text-ink-2">
        {res.w}×{res.h} · {res.fmt === "jpeg" ? "jpg" : res.fmt}
      </div>
      <div className="mt-3 grid grid-cols-3 gap-2">
        <a
          href={res.url}
          download={res.name}
          className="rounded-lg bg-ink px-3 py-2 text-center font-mono text-[11px] uppercase tracking-[0.14em] text-bone transition-colors hover:bg-ink/90"
        >
          save
        </a>
        <Btn onClick={onKeep}>edit</Btn>
        <Btn onClick={onNew}>new</Btn>
      </div>
    </div>
  );
}
