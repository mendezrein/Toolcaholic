"use client";

import { useState } from "react";

const LOG = [
  "v0.1.0 · built studio, wheel, image tools",
  "v0.1.0 · wired gif frames, crop, resize",
];

export default function Chip() {
  const [open, setOpen] = useState(false);
  return (
    <div className="fixed z-[9999] font-mono text-[11px] leading-[1.4]" style={{ right: 12, bottom: "calc(12px + env(safe-area-inset-bottom))" }}>
      {open ? (
        <div
          className="mb-2 w-[min(70vw,320px)] rounded-md p-2.5"
          style={{ background: "#F97316", color: "#1A0F02", boxShadow: "0 12px 28px -14px rgba(21,19,15,.5)" }}
        >
          <div className="mb-1 font-semibold uppercase tracking-[0.12em]">changelog</div>
          {LOG.map((l) => (
            <div key={l} className="truncate opacity-90">
              {l}
            </div>
          ))}
        </div>
      ) : null}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="block max-w-[min(70vw,420px)] truncate rounded-md px-2.5 py-1.5 text-left"
        style={{ background: "#F97316", color: "#1A0F02", opacity: 0.9 }}
      >
        #ckpt-toolcaholic-&quot;v0.1.0 • built studio, wheel, tools&quot;
      </button>
    </div>
  );
}
