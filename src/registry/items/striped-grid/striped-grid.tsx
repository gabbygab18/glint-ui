"use client";

import { useEffect, useRef } from "react";

export interface StripedGridProps {
  /** Px per cell, including the gap. */
  cellSize?: number;
  /** Px between cells. */
  gap?: number;
  /** Px between stripes inside a cell. */
  stripeSpacing?: number;
  /** Stripe and outline color of resting cells. */
  stripeColor?: string;
  /** Color of cells under the cursor. */
  highlightColor?: string;
  /** Scroll speed in px per second; 0 holds the grid still. */
  speed?: number;
  className?: string;
}

function rgb(hex: string) {
  let h = hex.replace("#", "");
  if (h.length === 3) h = h.replace(/./g, "$&$&");
  const n = parseInt(h.padEnd(6, "0").slice(0, 6), 16) || 0;
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

export function StripedGrid({
  cellSize = 56,
  gap = 8,
  stripeSpacing = 7,
  stripeColor = "#52525b",
  highlightColor = "#c6ff3d",
  speed = 12,
  className,
}: StripedGridProps) {
  const ref = useRef<HTMLCanvasElement>(null);
  const opts = useRef({ cellSize, gap, stripeSpacing, c: rgb(stripeColor), hl: rgb(highlightColor), speed });
  const redraw = useRef<() => void>(undefined);

  useEffect(() => {
    opts.current = { cellSize, gap, stripeSpacing, c: rgb(stripeColor), hl: rgb(highlightColor), speed };
    redraw.current?.();
  }, [cellSize, gap, stripeSpacing, stripeColor, highlightColor, speed]);

  useEffect(() => {
    const canvas = ref.current!;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const area = canvas.parentElement ?? canvas;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    // Heat per world cell ("i,j"), so highlights stay attached to cells as the grid scrolls.
    const heat = new Map<string, number>();
    const mouse = { x: -1e4, y: -1e4 };
    let w = 0;
    let h = 0;
    let off = 0;
    let raf = 0;
    let last = 0;

    // Diagonal stripes covering a rect, phase-locked to world space so they scroll with the grid.
    const stripes = (x: number, y: number, size: number, sp: number) => {
      const phase = (((x + y - 2 * off) % sp) + sp) % sp;
      for (let d = (sp - phase) % sp; d < size * 2; d += sp) {
        const x0 = x + Math.max(0, d - size);
        const y0 = y + Math.min(d, size);
        const x1 = x + Math.min(d, size);
        const y1 = y + Math.max(0, d - size);
        ctx.moveTo(x0, y0);
        ctx.lineTo(x1, y1);
      }
    };

    const draw = (dt: number) => {
      const o = opts.current;
      const s = Math.max(12, o.cellSize);
      const gp = Math.min(Math.max(0, o.gap), s - 4);
      const inner = s - gp;
      const sp = Math.max(3, o.stripeSpacing);
      off += dt * o.speed;
      const sx = ((off % s) + s) % s;
      const base = Math.floor(off / s);

      const decay = Math.exp(-dt * 2.2);
      for (const [k, v] of heat) {
        const nv = v * decay;
        if (nv < 0.01) heat.delete(k);
        else heat.set(k, nv);
      }
      // Cell under the cursor (in world indices).
      const mi = Math.floor((mouse.x - sx) / s) - base;
      const mj = Math.floor((mouse.y - sx) / s) - base;
      if (mouse.x > -1e3) {
        const lx = mouse.x - sx - (mi + base) * s;
        const ly = mouse.y - sx - (mj + base) * s;
        if (lx >= gp / 2 && lx < s - gp / 2 && ly >= gp / 2 && ly < s - gp / 2) heat.set(`${mi},${mj}`, 1);
      }

      ctx.clearRect(0, 0, w, h);
      const [r, g, b] = o.c;
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (let x = sx - s; x < w; x += s) {
        for (let y = sx - s; y < h; y += s) {
          stripes(x + gp / 2, y + gp / 2, inner, sp);
        }
      }
      ctx.strokeStyle = `rgba(${r},${g},${b},0.45)`;
      ctx.stroke();
      ctx.beginPath();
      for (let x = sx - s; x < w; x += s) {
        for (let y = sx - s; y < h; y += s) ctx.rect(x + gp / 2 + 0.5, y + gp / 2 + 0.5, inner - 1, inner - 1);
      }
      ctx.strokeStyle = `rgba(${r},${g},${b},0.6)`;
      ctx.stroke();

      const [hr, hg, hb] = o.hl;
      for (const [k, v] of heat) {
        const [i, j] = k.split(",").map(Number);
        const x = sx + (i + base) * s + gp / 2;
        const y = sx + (j + base) * s + gp / 2;
        if (x > w || y > h || x + inner < 0 || y + inner < 0) continue;
        const e = v * v * (3 - 2 * v);
        ctx.fillStyle = `rgba(${hr},${hg},${hb},${0.12 * e})`;
        ctx.fillRect(x, y, inner, inner);
        ctx.beginPath();
        stripes(x, y, inner, sp);
        ctx.strokeStyle = `rgba(${hr},${hg},${hb},${0.85 * e})`;
        ctx.lineWidth = 1.2;
        ctx.stroke();
        ctx.strokeStyle = `rgba(${hr},${hg},${hb},${e})`;
        ctx.lineWidth = 1;
        ctx.strokeRect(x + 0.5, y + 0.5, inner - 1, inner - 1);
      }
    };

    const loop = (now: number) => {
      draw(last ? Math.min((now - last) / 1000, 0.1) : 0);
      last = now;
      raf = requestAnimationFrame(loop);
    };

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = canvas.offsetWidth;
      h = canvas.offsetHeight;
      canvas.width = Math.max(1, Math.round(w * dpr));
      canvas.height = Math.max(1, Math.round(h * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      draw(0);
    };

    const onMove = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect();
      mouse.x = e.clientX - r.left;
      mouse.y = e.clientY - r.top;
      if (!raf) draw(0);
    };
    const onLeave = () => {
      mouse.x = mouse.y = -1e4;
    };

    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    const io = new IntersectionObserver(([e]) => {
      cancelAnimationFrame(raf);
      raf = 0;
      last = 0;
      if (e.isIntersecting && !reduced) raf = requestAnimationFrame(loop);
    });
    io.observe(canvas);
    redraw.current = () => {
      if (!raf) draw(0);
    };
    area.addEventListener("pointermove", onMove, { passive: true });
    area.addEventListener("pointerleave", onLeave);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      redraw.current = undefined;
      area.removeEventListener("pointermove", onMove);
      area.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  const mask = "radial-gradient(ellipse 80% 80% at 50% 50%, #000 25%, transparent 100%)";
  return (
    <canvas
      ref={ref}
      aria-hidden
      className={className}
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        maskImage: mask,
        WebkitMaskImage: mask,
      }}
    />
  );
}
