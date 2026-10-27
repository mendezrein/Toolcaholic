"use client";

import { useEffect, useState } from "react";
import { animated, baseCanvas, canvasOf, cropImg, cropRect, encode, fmtSize, rotateImg, scaleTo } from "@/lib/img";
import { EXT } from "@/lib/img";
import { gifFrames, type GifFrame } from "@/lib/gif";
import type { Done, Fmt, Src, ToolId } from "@/lib/types";
import { Btn, Label, Note, Seg, Slider } from "./ui";

function useRun(onDone: Done) {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const run = async (fn: () => Promise<{ blob: Blob; w: number; h: number; fmt: Fmt }>) => {
    setBusy(true);
    setErr(null);
    try {
      const r = await fn();
      onDone(r.blob, r.w, r.h, r.fmt);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "failed");
      setBusy(false);
    }
  };
  return { busy, err, run };
}

function Shell({
  title,
  src,
  children,
  onClose,
  foot,
  err,
}: {
  title: string;
  src: Src;
  children: React.ReactNode;
  onClose: () => void;
  foot: React.ReactNode;
  err: string | null;
}) {
  return (
    <div className="flex max-h-full flex-col">
      <header className="flex items-center justify-between border-b border-ink/10 px-5 py-4">
        <div className="flex min-w-0 items-center gap-2.5">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={src.url} alt="" className="size-6 shrink-0 rounded border border-ink/10 object-cover lg:hidden" />
          <Label>{title}</Label>
          <span className="truncate font-mono text-[10px] text-ink-2 lg:hidden">{src.file.name}</span>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="close tool"
          className="grid size-7 place-items-center rounded-md border border-ink/15 text-ink-2 transition-colors hover:bg-ink/5 hover:text-ink"
        >
          <svg width="10" height="10" viewBox="0 0 10 10" aria-hidden>
            <path d="M1 1l8 8M9 1l-8 8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
          </svg>
        </button>
      </header>
      <div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-5 py-5">{children}</div>
      <footer className="space-y-2 border-t border-ink/10 px-5 pb-16 pt-4 lg:pb-4">
        {err ? <p className="font-mono text-[10px] text-red-700">{err}</p> : null}
        {foot}
      </footer>
    </div>
  );
}

export function ConvertPanel({ src, onDone, onClose }: { src: Src; onDone: Done; onClose: () => void }) {
  const [fmt, setFmt] = useState<Fmt>(src.fmt === "jpeg" ? "png" : "jpeg");
  const [q, setQ] = useState(0.92);
  const { busy, err, run } = useRun(onDone);

  const apply = () =>
    run(async () => {
      if (src.gif && fmt === "gif") return { blob: src.file, w: src.w, h: src.h, fmt };
      const cv = baseCanvas(src);
      return { blob: await encode(cv, fmt, q), w: cv.width, h: cv.height, fmt };
    });

  return (
    <Shell
      title="convert"
      src={src}
      onClose={onClose}
      err={err}
      foot={
        <Btn full kind="solid" disabled={busy} onClick={apply}>
          {busy ? "working…" : `convert to ${EXT[fmt]}`}
        </Btn>
      }
    >
      <div className="space-y-2">
        <Label>format</Label>
        <Seg
          value={fmt}
          onChange={setFmt}
          options={[
            { v: "png", l: "png" },
            { v: "jpeg", l: "jpg" },
            { v: "gif", l: "gif" },
          ]}
        />
      </div>
      {fmt !== "png" ? <Slider label="quality" value={q} min={0.3} max={1} step={0.01} onChange={setQ} read={`${Math.round(q * 100)}%`} /> : null}
      <Note>
        {src.w}×{src.h} · {fmtSize(src.size)}
        {src.gif ? (fmt === "gif" ? " · gif: animation kept" : " · gif: static frame only") : ""}
        {fmt === "gif" ? " · gif: 256 colors" : ""}
      </Note>
    </Shell>
  );
}

export function CompressPanel({ src, onDone, onClose }: { src: Src; onDone: Done; onClose: () => void }) {
  const [q, setQ] = useState(0.75);
  const [scale, setScale] = useState(100);
  const { busy, err, run } = useRun(onDone);
  const w = Math.max(1, Math.round((src.w * scale) / 100));
  const h = Math.max(1, Math.round((src.h * scale) / 100));

  const apply = () =>
    run(async () => {
      if (src.gif) {
        const r = await animated(src, (cv) => scaleTo(cv, w, h));
        return { ...r, fmt: "gif" as Fmt };
      }
      const cv = canvasOf(w, h, src.bmp);
      return { blob: await encode(cv, src.fmt, q), w, h, fmt: src.fmt };
    });

  return (
    <Shell
      title="compress"
      src={src}
      onClose={onClose}
      err={err}
      foot={
        <Btn full kind="solid" disabled={busy} onClick={apply}>
          {busy ? "working…" : "compress"}
        </Btn>
      }
    >
      <Slider label="quality" value={q} min={0.3} max={1} step={0.01} onChange={setQ} read={`${Math.round(q * 100)}%`} />
      <Slider label="scale" value={scale} min={10} max={100} step={1} onChange={setScale} read={`${scale}%`} />
      <Note>
        {src.w}×{src.h} → {w}×{h} · {fmtSize(src.size)} · {EXT[src.fmt]}
        {src.fmt === "png" ? " · png is lossless: scale does the work" : ""}
        {src.gif ? " · gif: all frames kept" : ""}
      </Note>
    </Shell>
  );
}

export function ResizePanel({ src, onDone, onClose }: { src: Src; onDone: Done; onClose: () => void }) {
  const [w, setW] = useState(src.w);
  const [h, setH] = useState(src.h);
  const [lock, setLock] = useState(true);
  const { busy, err, run } = useRun(onDone);
  const ratio = src.w / src.h;

  const setWidth = (n: number) => {
    const v = Math.max(1, Math.min(10000, Math.round(n) || 1));
    setW(v);
    if (lock) setH(Math.max(1, Math.round(v / ratio)));
  };
  const setHeight = (n: number) => {
    const v = Math.max(1, Math.min(10000, Math.round(n) || 1));
    setH(v);
    if (lock) setW(Math.max(1, Math.round(v * ratio)));
  };

  const apply = () =>
    run(async () => {
      if (src.gif) {
        const r = await animated(src, (cv) => scaleTo(cv, w, h));
        return { ...r, fmt: "gif" as Fmt };
      }
      const cv = scaleTo(src.bmp, w, h);
      return { blob: await encode(cv, src.fmt, 0.92), w, h, fmt: src.fmt };
    });

  return (
    <Shell
      title="resize"
      src={src}
      onClose={onClose}
      err={err}
      foot={
        <Btn full kind="solid" disabled={busy} onClick={apply}>
          {busy ? "working…" : `resize to ${w}×${h}`}
        </Btn>
      }
    >
      <div className="grid grid-cols-2 gap-3">
        <label className="block">
          <Label>width</Label>
          <input
            type="number"
            value={w}
            min={1}
            onChange={(e) => setWidth(Number(e.target.value))}
            className="mt-2 w-full rounded-lg border border-ink/15 bg-white/50 px-3 py-2 font-mono text-sm outline-none focus:border-ink/40"
          />
        </label>
        <label className="block">
          <Label>height</Label>
          <input
            type="number"
            value={h}
            min={1}
            onChange={(e) => setHeight(Number(e.target.value))}
            className="mt-2 w-full rounded-lg border border-ink/15 bg-white/50 px-3 py-2 font-mono text-sm outline-none focus:border-ink/40"
          />
        </label>
      </div>
      <button
        type="button"
        onClick={() => setLock((v) => !v)}
        className={`w-full rounded-lg border px-3 py-2 font-mono text-[10px] uppercase tracking-[0.14em] transition-colors ${
          lock ? "border-ink bg-ink/5 text-ink" : "border-ink/15 text-ink-2 hover:bg-ink/5"
        }`}
      >
        {lock ? "ratio locked" : "ratio free"}
      </button>
      <div className="flex gap-2">
        {[25, 50, 75, 100].map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => {
              setWidth(Math.round((src.w * p) / 100));
            }}
            className="flex-1 rounded-md border border-ink/15 px-2 py-1.5 font-mono text-[10px] text-ink-2 transition-colors hover:bg-ink/5 hover:text-ink"
          >
            {p}%
          </button>
        ))}
      </div>
      <Note>
        source {src.w}×{src.h} · {fmtSize(src.size)}
      </Note>
    </Shell>
  );
}

export function RotatePanel({ src, onDone, onClose }: { src: Src; onDone: Done; onClose: () => void }) {
  const [deg, setDeg] = useState(0);
  const [fh, setFh] = useState(false);
  const [fv, setFv] = useState(false);
  const { busy, err, run } = useRun(onDone);
  const swap = Math.abs(deg) % 180 !== 0;

  const apply = () =>
    run(async () => {
      if (src.gif) {
        const r = await animated(src, (cv) => rotateImg(cv, src.w, src.h, deg, fh, fv));
        return { ...r, fmt: "gif" as Fmt };
      }
      const cv = rotateImg(src.bmp, src.w, src.h, deg, fh, fv);
      return { blob: await encode(cv, src.fmt, 0.92), w: cv.width, h: cv.height, fmt: src.fmt };
    });

  return (
    <Shell
      title="rotate"
      src={src}
      onClose={onClose}
      err={err}
      foot={
        <Btn full kind="solid" disabled={busy} onClick={apply}>
          {busy ? "working…" : "apply"}
        </Btn>
      }
    >
      <div className="grid h-[150px] place-items-center overflow-hidden rounded-lg border border-ink/10 bg-white/40">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src.url}
          alt=""
          className="max-h-full max-w-full object-contain transition-transform duration-300"
          style={{
            transform: `rotate(${deg}deg) scaleX(${fh ? -1 : 1}) scaleY(${fv ? -1 : 1}) scale(${swap ? 0.66 : 1})`,
          }}
        />
      </div>
      <div className="grid grid-cols-4 gap-2">
        {[0, 90, 180, 270].map((d) => (
          <button
            key={d}
            type="button"
            onClick={() => setDeg(d)}
            className={`rounded-md border px-2 py-2 font-mono text-[10px] transition-colors ${
              deg === d ? "border-ink bg-ink text-bone" : "border-ink/15 text-ink-2 hover:bg-ink/5"
            }`}
          >
            {d}°
          </button>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-2">
        <Btn onClick={() => setFh((v) => !v)}>{fh ? "flip h on" : "flip h"}</Btn>
        <Btn onClick={() => setFv((v) => !v)}>{fv ? "flip v on" : "flip v"}</Btn>
      </div>
      <Note>
        out {swap ? `${src.h}×${src.w}` : `${src.w}×${src.h}`} · {EXT[src.fmt]}
      </Note>
    </Shell>
  );
}

const RATIOS: { l: string; v: number | null }[] = [
  { l: "free", v: null },
  { l: "1:1", v: 1 },
  { l: "4:3", v: 4 / 3 },
  { l: "3:2", v: 3 / 2 },
  { l: "16:9", v: 16 / 9 },
];

export function CropPanel({ src, onDone, onClose }: { src: Src; onDone: Done; onClose: () => void }) {
  const [ratio, setRatio] = useState<number | null>(1);
  const [zoom, setZoom] = useState(1);
  const [ox, setOx] = useState(0);
  const [oy, setOy] = useState(0);
  const { busy, err, run } = useRun(onDone);

  const fit = cropRect(src.w, src.h, ratio, zoom, ox, oy);

  const apply = () =>
    run(async () => {
      if (src.gif) {
        const r = await animated(src, (cv) => cropImg(cv, cv.width, cv.height, ratio, zoom, ox, oy));
        return { ...r, fmt: "gif" as Fmt };
      }
      const cv = cropImg(src.bmp, src.w, src.h, ratio, zoom, ox, oy);
      return { blob: await encode(cv, src.fmt, 0.92), w: cv.width, h: cv.height, fmt: src.fmt };
    });

  const previewRatio = ratio ?? src.w / src.h;
  const bgW = (src.w / fit.sw) * 100;
  const bgH = (src.h / fit.sh) * 100;
  const bgX = fit.slackX > 0 ? (fit.sx / fit.slackX) * 100 : 50;
  const bgY = fit.slackY > 0 ? (fit.sy / fit.slackY) * 100 : 50;

  return (
    <Shell
      title="crop"
      src={src}
      onClose={onClose}
      err={err}
      foot={
        <Btn full kind="solid" disabled={busy} onClick={apply}>
          {busy ? "working…" : `crop ${Math.round(fit.sw)}×${Math.round(fit.sh)}`}
        </Btn>
      }
    >
      <div
        className="w-full overflow-hidden rounded-lg border border-ink/10 bg-ink/5"
        style={{ aspectRatio: `${previewRatio}`, backgroundImage: `url(${src.url})`, backgroundSize: `${bgW}% ${bgH}%`, backgroundPosition: `${bgX}% ${bgY}%`, backgroundRepeat: "no-repeat" }}
      />
      <div className="space-y-2">
        <Label>ratio</Label>
        <div className="flex gap-1">
          {RATIOS.map((r) => (
            <button
              key={r.l}
              type="button"
              onClick={() => setRatio(r.v)}
              className={`flex-1 rounded-md border px-1 py-1.5 font-mono text-[10px] transition-colors ${
                ratio === r.v ? "border-ink bg-ink text-bone" : "border-ink/15 text-ink-2 hover:bg-ink/5"
              }`}
            >
              {r.l}
            </button>
          ))}
        </div>
      </div>
      <Slider label="zoom" value={zoom} min={1} max={4} step={0.05} onChange={setZoom} read={`${zoom.toFixed(2)}×`} />
      <Slider label="pan x" value={ox} min={-1} max={1} step={0.02} onChange={setOx} read={ox.toFixed(2)} />
      <Slider label="pan y" value={oy} min={-1} max={1} step={0.02} onChange={setOy} read={oy.toFixed(2)} />
      <Note>
        out {Math.round(fit.sw)}×{Math.round(fit.sh)} · {EXT[src.fmt]}
      </Note>
    </Shell>
  );
}

function downloadCanvas(cv: HTMLCanvasElement, name: string) {
  cv.toBlob((b) => {
    if (!b) return;
    const url = URL.createObjectURL(b);
    const a = document.createElement("a");
    a.href = url;
    a.download = name;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 2000);
  }, "image/png");
}

export function FramesPanel({ src, onClose }: { src: Src; onDone: Done; onClose: () => void }) {
  const [frames, setFrames] = useState<GifFrame[] | null>(null);
  const [loadErr, setLoadErr] = useState<string | null>(null);
  const err = !src.gif ? "only gif has frames" : loadErr;

  useEffect(() => {
    let live = true;
    if (!src.gif) return;
    gifFrames(src.file)
      .then((f) => live && setFrames(f))
      .catch(() => live && setLoadErr("can't read frames"));
    return () => {
      live = false;
    };
  }, [src]);

  return (
    <Shell title="frames" src={src} onClose={onClose} err={err} foot={<Note>{frames ? `${frames.length} frames · png out` : "reading…"}</Note>}>
      {frames && frames.length > 0 ? (
        <div className="grid grid-cols-3 gap-2">
          {frames.map((f, i) => (
            <button
              key={i}
              type="button"
              onClick={() => downloadCanvas(f.canvas, `${src.file.name.replace(/\.gif$/i, "")}-${i + 1}.png`)}
              className="group relative overflow-hidden rounded-md border border-ink/10 bg-white/40"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={f.canvas.toDataURL("image/png")} alt={`frame ${i + 1}`} className="aspect-square w-full object-contain" />
              <span className="absolute bottom-1 left-1 rounded bg-ink/80 px-1 font-mono text-[9px] text-bone opacity-0 transition-opacity group-hover:opacity-100">
                {i + 1}
              </span>
            </button>
          ))}
        </div>
      ) : null}
    </Shell>
  );
}

export const PANELS: Record<ToolId, (p: { src: Src; onDone: Done; onClose: () => void }) => React.ReactElement> = {
  convert: ConvertPanel,
  compress: CompressPanel,
  resize: ResizePanel,
  rotate: RotatePanel,
  crop: CropPanel,
  frames: (p) => <FramesPanel src={p.src} onDone={p.onDone} onClose={p.onClose} />,
};
