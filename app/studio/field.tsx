"use client";

import { useEffect, useRef } from "react";

type P = { x: number; y: number; vx: number; vy: number; r: number; h: number; ph: number };
type G = { x: number; y: number; vx: number; vy: number; rot: number; vr: number; label: string; s: number };
type B = { x: number; y: number; r: number; ax: number; ay: number; sp: number; ph: number; c: string };
type Q = { x: number; y: number; r: number; life: number };

const LABELS = ["shot.jpg", "art.png", "loop.gif", "scan.jpeg", "render.png", "anim.gif", "mood.jpg"];

export default function Field({ calm }: { calm: boolean }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const calmRef = useRef(calm);

  useEffect(() => {
    calmRef.current = calm;
  }, [calm]);

  useEffect(() => {
    const cv = ref.current;
    if (!cv) return;
    const ctx = cv.getContext("2d");
    if (!ctx) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let w = 0;
    let h = 0;
    let raf = 0;
    let t = 0;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const ps: P[] = [];
    const gs: G[] = [];
    const bs: B[] = [];
    const qs: Q[] = [];
    const mouse = { x: -9999, y: -9999 };

    const seed = () => {
      ps.length = 0;
      gs.length = 0;
      bs.length = 0;
      qs.length = 0;
      const n = Math.min(84, Math.max(30, Math.round((w * h) / 26000)));
      for (let i = 0; i < n; i += 1) {
        ps.push({
          x: Math.random() * w,
          y: Math.random() * h,
          vx: (Math.random() - 0.5) * 0.36,
          vy: (Math.random() - 0.5) * 0.36,
          r: 0.9 + Math.random() * 2.3,
          h: Math.random(),
          ph: Math.random() * Math.PI * 2,
        });
      }
      const m = w < 720 ? 5 : 7;
      const keep = Math.min(w, h) * 0.36;
      const spot = () => {
        for (let k = 0; k < 24; k += 1) {
          const x = Math.random() * w;
          const y = Math.random() * h;
          if (Math.hypot(x - w / 2, y - h / 2) > keep) return { x, y };
        }
        return { x: Math.random() < 0.5 ? 70 : w - 70, y: Math.random() * h };
      };
      for (let i = 0; i < m; i += 1) {
        const at = spot();
        gs.push({
          x: at.x,
          y: at.y,
          vx: (Math.random() - 0.5) * 0.22,
          vy: (Math.random() - 0.5) * 0.22,
          rot: (Math.random() - 0.5) * 0.5,
          vr: (Math.random() - 0.5) * 0.0016,
          label: LABELS[i % LABELS.length],
          s: 0.75 + Math.random() * 0.6,
        });
      }
      const palette = [
        "rgba(249,115,22,0.13)",
        "rgba(255,252,244,0.75)",
        "rgba(214,196,166,0.3)",
        "rgba(96,112,104,0.1)",
      ];
      for (let i = 0; i < 4; i += 1) {
        const r = Math.max(w, h) * (0.24 + Math.random() * 0.16);
        bs.push({
          x: Math.random() * w,
          y: Math.random() * h,
          r,
          ax: w * (0.14 + Math.random() * 0.16),
          ay: h * (0.14 + Math.random() * 0.16),
          sp: 0.00016 + Math.random() * 0.0002,
          ph: Math.random() * Math.PI * 2,
          c: palette[i],
        });
      }
    };

    const resize = () => {
      w = window.innerWidth;
      h = window.innerHeight;
      cv.width = Math.round(w * dpr);
      cv.height = Math.round(h * dpr);
      cv.style.width = `${w}px`;
      cv.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      seed();
    };

    const onMove = (e: PointerEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };
    const onLeave = () => {
      mouse.x = -9999;
      mouse.y = -9999;
    };

    const fileCard = (g: G, alpha: number) => {
      const cw = 44 * g.s;
      const ch = 54 * g.s;
      ctx.save();
      ctx.translate(g.x, g.y);
      ctx.rotate(g.rot);
      ctx.globalAlpha = alpha;
      ctx.beginPath();
      ctx.roundRect(-cw / 2, -ch / 2, cw, ch, 4);
      ctx.fillStyle = "rgba(250,247,240,0.72)";
      ctx.fill();
      ctx.strokeStyle = "rgba(21,19,15,0.28)";
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(cw / 2 - 9, -ch / 2);
      ctx.lineTo(cw / 2, -ch / 2 + 9);
      ctx.strokeStyle = "rgba(21,19,15,0.22)";
      ctx.stroke();
      ctx.fillStyle = "rgba(21,19,15,0.5)";
      ctx.font = `600 ${7.5 * g.s}px ui-monospace, monospace`;
      ctx.textAlign = "left";
      ctx.fillText(g.label, -cw / 2 + 5, ch / 2 - 5);
      for (let i = 0; i < 3; i += 1) {
        ctx.fillStyle = `rgba(21,19,15,${0.12 - i * 0.02})`;
        ctx.fillRect(-cw / 2 + 5, -ch / 2 + 10 + i * 6, cw - 14 - i * 6, 2);
      }
      ctx.restore();
    };

    const draw = () => {
      t += 1;
      const calmNow = calmRef.current;
      const slow = calmNow ? 0.24 : 1;
      const px = (mouse.x - w / 2) / Math.max(w, 1);
      const py = (mouse.y - h / 2) / Math.max(h, 1);

      ctx.clearRect(0, 0, w, h);

      const base = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, Math.max(w, h) * 0.75);
      base.addColorStop(0, "rgba(255,253,248,0.92)");
      base.addColorStop(0.55, "rgba(241,236,226,0.28)");
      base.addColorStop(1, "rgba(224,214,197,0.6)");
      ctx.fillStyle = base;
      ctx.fillRect(0, 0, w, h);

      for (const b of bs) {
        const cx = b.x + Math.cos(t * b.sp * 6 + b.ph) * b.ax - px * 40;
        const cy = b.y + Math.sin(t * b.sp * 5 + b.ph * 1.4) * b.ay - py * 40;
        const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, b.r);
        g.addColorStop(0, b.c);
        g.addColorStop(1, "rgba(241,236,226,0)");
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(cx, cy, b.r, 0, Math.PI * 2);
        ctx.fill();
      }

      for (const p of ps) {
        p.ph += 0.004;
        p.vx += Math.sin(p.y * 0.0035 + t * 0.0016 + p.ph) * 0.006;
        p.vy += Math.cos(p.x * 0.0035 + t * 0.0013) * 0.006;
        p.vx *= 0.995;
        p.vy *= 0.995;
        p.x += p.vx * slow;
        p.y += p.vy * slow;
        const dx = p.x - mouse.x;
        const dy = p.y - mouse.y;
        const d2 = dx * dx + dy * dy;
        if (d2 < 28000 && d2 > 1) {
          const d = Math.sqrt(d2);
          p.x += (dx / d) * 0.5;
          p.y += (dy / d) * 0.5;
        }
        if (p.x < -20) p.x = w + 20;
        if (p.x > w + 20) p.x = -20;
        if (p.y < -20) p.y = h + 20;
        if (p.y > h + 20) p.y = -20;
      }

      if (!calmNow && t % 42 === 0) {
        const p = ps[Math.floor(Math.random() * ps.length)];
        qs.push({ x: p.x, y: p.y, r: 3, life: 1 });
      }
      for (let i = qs.length - 1; i >= 0; i -= 1) {
        const q = qs[i];
        q.r += 1.5;
        q.life -= 0.014;
        if (q.life <= 0) {
          qs.splice(i, 1);
          continue;
        }
        ctx.beginPath();
        ctx.arc(q.x, q.y, q.r, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(249,115,22,${q.life * 0.22})`;
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      const gAlpha = calmNow ? 0.16 : 0.5;
      const keepOut = Math.min(w, h) * 0.34;
      for (const g of gs) {
        g.x += g.vx * slow;
        g.y += g.vy * slow;
        g.rot += g.vr * slow;
        const dx = g.x - w / 2;
        const dy = g.y - h / 2;
        const d = Math.hypot(dx, dy);
        if (d < keepOut && d > 1) {
          g.vx += (dx / d) * 0.012;
          g.vy += (dy / d) * 0.012;
        }
        g.vx = Math.max(-0.5, Math.min(0.5, g.vx));
        g.vy = Math.max(-0.5, Math.min(0.5, g.vy));
        if (g.x < -90) g.x = w + 90;
        if (g.x > w + 90) g.x = -90;
        if (g.y < -90) g.y = h + 90;
        if (g.y > h + 90) g.y = -90;
        fileCard(g, gAlpha);
      }

      const link = 142;
      for (let i = 0; i < ps.length; i += 1) {
        const a = ps[i];
        const dm = Math.hypot(a.x - mouse.x, a.y - mouse.y);
        if (dm < 190) {
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(mouse.x, mouse.y);
          ctx.strokeStyle = `rgba(249,115,22,${0.16 * (1 - dm / 190)})`;
          ctx.lineWidth = 1;
          ctx.stroke();
        }
        for (let j = i + 1; j < ps.length; j += 1) {
          const b = ps[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const d = Math.hypot(dx, dy);
          if (d > link) continue;
          const k = 1 - d / link;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.strokeStyle = `rgba(21,19,15,${(calmNow ? 0.035 : 0.1) * k})`;
          ctx.lineWidth = 1;
          ctx.stroke();
          if ((i * 7 + j) % 11 === 0) {
            const ph = ((t * 0.0045 + (i + j) * 0.13) % 1) * (calmNow ? 0.4 : 1);
            const ex = a.x + (b.x - a.x) * ph;
            const ey = a.y + (b.y - a.y) * ph;
            ctx.beginPath();
            ctx.arc(ex, ey, 1.9, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(249,115,22,${0.42 * k + 0.1})`;
            ctx.fill();
          }
        }
      }

      for (const p of ps) {
        if (p.h > 0.78) {
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.r + 4.5, 0, Math.PI * 2);
          ctx.fillStyle = "rgba(249,115,22,0.08)";
          ctx.fill();
        }
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = p.h > 0.82 ? "rgba(249,115,22,0.6)" : `rgba(21,19,15,${calmNow ? 0.2 : 0.36})`;
        ctx.fill();
      }

      raf = window.requestAnimationFrame(draw);
    };

    resize();
    if (reduce) {
      draw();
      cancelAnimationFrame(raf);
    } else {
      raf = window.requestAnimationFrame(draw);
    }

    window.addEventListener("resize", resize);
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerleave", onLeave);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  return <canvas ref={ref} aria-hidden className="fixed inset-0 -z-10" />;
}
