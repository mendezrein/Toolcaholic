"use client";

import { useCallback, useEffect, useState } from "react";
import { EXT, baseName, fmtSize, loadSrc } from "@/lib/img";
import { TOOLS } from "@/lib/tools";
import type { Fmt, Res, Src, ToolId } from "@/lib/types";
import Field from "./field";
import Wheel from "./wheel";
import { FileCard, ResultCard } from "./card";
import { PANELS } from "./panel";
import Chip from "./chip";
import { Btn } from "./ui";

const TYPES = ["image/png", "image/jpeg", "image/gif", "image/webp"];

export default function Studio() {
  const [src, setSrc] = useState<Src | null>(null);
  const [res, setRes] = useState<Res | null>(null);
  const [tool, setTool] = useState<ToolId | null>(null);
  const [drag, setDrag] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const openFile = useCallback(async (file: File) => {
    if (!TYPES.includes(file.type)) {
      setErr("png · jpg · gif only");
      return;
    }
    try {
      const s = await loadSrc(file);
      setSrc((prev) => {
        if (prev) URL.revokeObjectURL(prev.url);
        return s;
      });
      setRes((prev) => {
        if (prev) URL.revokeObjectURL(prev.url);
        return null;
      });
      setTool(null);
      setErr(null);
    } catch {
      setErr("can't read that image");
    }
  }, []);

  const reset = useCallback(() => {
    setSrc((prev) => {
      if (prev) URL.revokeObjectURL(prev.url);
      return null;
    });
    setRes((prev) => {
      if (prev) URL.revokeObjectURL(prev.url);
      return null;
    });
    setTool(null);
  }, []);

  const done = useCallback(
    (blob: Blob, w: number, h: number, fmt: Fmt) => {
      const name = `${baseName(src?.file.name ?? "image")}-${tool ?? "out"}.${EXT[fmt]}`;
      setRes((prev) => {
        if (prev) URL.revokeObjectURL(prev.url);
        return { blob, url: URL.createObjectURL(blob), w, h, fmt, name };
      });
      setTool(null);
    },
    [src, tool],
  );

  const keep = useCallback(async () => {
    if (!res) return;
    try {
      const s = await loadSrc(new File([res.blob], res.name, { type: res.blob.type || "image/png" }));
      setSrc((prev) => {
        if (prev) URL.revokeObjectURL(prev.url);
        return s;
      });
      setRes((prev) => {
        if (prev) URL.revokeObjectURL(prev.url);
        return null;
      });
      setTool(null);
    } catch {
      setErr("can't reopen result");
    }
  }, [res]);

  useEffect(() => {
    if (!err) return;
    const id = setTimeout(() => setErr(null), 3200);
    return () => clearTimeout(id);
  }, [err]);

  useEffect(() => {
    const over = (e: DragEvent) => {
      e.preventDefault();
      if (e.dataTransfer?.types.includes("Files")) setDrag(true);
    };
    const leave = (e: DragEvent) => {
      if (!e.relatedTarget) setDrag(false);
    };
    const drop = (e: DragEvent) => {
      e.preventDefault();
      setDrag(false);
      const f = e.dataTransfer?.files?.[0];
      if (f) void openFile(f);
    };
    const paste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;
      for (const it of items) {
        if (it.type.startsWith("image/")) {
          const f = it.getAsFile();
          if (f) {
            void openFile(f);
            break;
          }
        }
      }
    };
    const key = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (tool) setTool(null);
        else if (src) reset();
        return;
      }
      const n = Number(e.key);
      if (src && !res && n >= 1 && n <= TOOLS.length) setTool(TOOLS[n - 1].id);
    };

    window.addEventListener("dragover", over);
    window.addEventListener("dragleave", leave);
    window.addEventListener("drop", drop);
    window.addEventListener("paste", paste);
    window.addEventListener("keydown", key);
    return () => {
      window.removeEventListener("dragover", over);
      window.removeEventListener("dragleave", leave);
      window.removeEventListener("drop", drop);
      window.removeEventListener("paste", paste);
      window.removeEventListener("keydown", key);
    };
  }, [openFile, reset, src, res, tool]);

  const Panel = tool ? PANELS[tool] : null;

  return (
    <main className="relative min-h-dvh overflow-hidden">
      <Field calm={!!src} />

      <header className="fixed inset-x-0 top-0 z-20 flex items-start justify-between px-5 py-4 sm:px-8 sm:py-6">
        <div>
          <div className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.3em] text-ink">
            <span className="size-1.5 rounded-full bg-flame" />
            toolcaholic
          </div>
          <div className="mt-1 hidden font-mono text-[10px] tracking-wide text-ink-2 sm:block">every image, one wheel</div>
        </div>
        <div className="flex items-center gap-3">
          <span className="hidden font-mono text-[10px] uppercase tracking-[0.18em] text-ink-2 sm:block">png · jpg · gif</span>
          {src ? <Btn onClick={reset}>new file</Btn> : null}
        </div>
      </header>

      <section className="relative z-10 flex min-h-dvh flex-col items-center justify-center px-4 pb-24 pt-28">
        {!src ? (
          <div className="text-center">
            <h1 className="rise font-display text-[clamp(3.4rem,9vw,6.5rem)] leading-[0.92] tracking-[-0.02em] text-ink">
              drop it<span className="text-flame">.</span>
            </h1>
            <p
              className="rise mx-auto mt-4 max-w-xs font-mono text-[10px] uppercase leading-relaxed tracking-[0.18em] text-ink-2"
              style={{ animationDelay: "80ms" }}
            >
              png · jpg · gif
              <br />
              read, moved, written in your browser
            </p>
            <div className="relative mx-auto mt-10 grid size-[min(58vw,240px)] place-items-center">
              <svg className="spin-ring absolute inset-0 h-full w-full" viewBox="0 0 200 200" aria-hidden>
                <circle cx="100" cy="100" r="97" fill="none" stroke="rgba(21,19,15,0.24)" strokeWidth="1" strokeDasharray="2 8" strokeLinecap="round" />
              </svg>
              <svg className="spin-ring-r absolute inset-0 h-full w-full" viewBox="0 0 200 200" aria-hidden>
                <circle cx="100" cy="100" r="88" fill="none" stroke="rgba(249,115,22,0.25)" strokeWidth="1" strokeDasharray="28 220" />
              </svg>
              <span className="rise font-mono text-[10px] uppercase tracking-[0.24em] text-ink-2" style={{ animationDelay: "160ms" }}>
                drop · paste
              </span>
            </div>
          </div>
        ) : null}

        {src && !res ? (
          <div
            className={`relative ${tool ? "hidden lg:grid" : "grid"} place-items-center transition-transform duration-500 ease-out ${tool ? "lg:-translate-x-[180px]" : ""}`}
          >
            <Wheel onPick={setTool} />
            <div className="pointer-events-none absolute inset-0 grid place-items-center">
              <FileCard src={src} />
            </div>
          </div>
        ) : null}

        {src && !res && tool ? (
          <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-ink-2 lg:hidden">close to pick another tool</p>
        ) : null}

        {res && src ? (
          <ResultCard res={res} from={src.size} onKeep={() => void keep()} onNew={reset} />
        ) : null}
      </section>

      {Panel && src ? (
        <aside className="fixed inset-x-0 bottom-0 z-30 max-h-[68vh] overflow-hidden rounded-t-2xl border-t border-ink/10 bg-[#F7F2E9]/95 backdrop-blur-md lg:inset-x-auto lg:bottom-auto lg:right-5 lg:top-[92px] lg:max-h-[calc(100vh-200px)] lg:w-[352px] lg:rounded-xl lg:border">
          <Panel src={src} onDone={done} onClose={() => setTool(null)} />
        </aside>
      ) : null}

      <div className="pointer-events-none fixed inset-x-0 bottom-5 left-5 z-10 hidden font-mono text-[10px] uppercase tracking-[0.2em] text-ink-2 sm:block">
        drop · paste · esc
      </div>

      {src ? (
        <div className="pointer-events-none fixed bottom-5 left-1/2 z-10 hidden -translate-x-1/2 font-mono text-[10px] uppercase tracking-[0.2em] text-ink-2 lg:block">
          {src.file.name} · {src.w}×{src.h} · {fmtSize(src.size)}
        </div>
      ) : null}

      {drag ? (
        <div className="fixed inset-0 z-40 grid place-items-center bg-bone/90 backdrop-blur-md">
          <div className="grid size-[min(70vw,340px)] place-items-center rounded-full border-2 border-dashed border-flame/70">
            <div className="text-center">
              <div className="font-mono text-[11px] uppercase tracking-[0.3em] text-ink">release</div>
              <div className="mt-2 font-mono text-[10px] uppercase tracking-[0.2em] text-ink-2">png · jpg · gif</div>
            </div>
          </div>
        </div>
      ) : null}

      {err ? (
        <div className="fixed bottom-16 left-1/2 z-40 -translate-x-1/2 rounded-lg bg-ink px-4 py-2 font-mono text-[11px] text-bone">{err}</div>
      ) : null}

      <Chip />
    </main>
  );
}
