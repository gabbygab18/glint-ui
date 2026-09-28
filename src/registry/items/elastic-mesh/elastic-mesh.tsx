"use client";

import { useEffect, useRef } from "react";

export interface ElasticMeshProps {
  /** Px between mesh points. */
  spacing?: number;
  /** Px radius the cursor bends. */
  radius?: number;
  /** Cursor force multiplier. */
  strength?: number;
  /** Pull back toward rest, 0–1. Higher = snappier. */
  stiffness?: number;
  /** Velocity kept per frame, 0–1. Higher = wobblier. */
  damping?: number;
  /** Push the mesh away from the cursor or pull it in. */
  mode?: "push" | "pull";
  /** Idle line color (6-digit hex). */
  lineColor?: string;
  /** Color of stretched lines (6-digit hex). */
  activeColor?: string;
  className?: string;
}

const rgb = (hex: string) => {
  const n = parseInt(hex.replace("#", "").padEnd(6, "0").slice(0, 6), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
};
const BUCKETS = 8;

export function ElasticMesh({
  spacing = 34,
  radius = 170,
  strength = 1,
  stiffness = 0.05,
  damping = 0.88,
  mode = "push",
  lineColor = "#34343c",
  activeColor = "#c6ff3d",
  className,
}: ElasticMeshProps) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current!;
    const host = canvas.parentElement!;
    const ctx = canvas.getContext("2d")!;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const a = rgb(lineColor);
    const b = rgb(activeColor);
    const colors = Array.from({ length: BUCKETS }, (_, k) => {
      const t = k / (BUCKETS - 1);
      return `rgb(${a.map((v, i) => Math.round(v + (b[i] - v) * t)).join(",")})`;
    });
    const mouse = { x: -1e4, y: -1e4, in: false };
    const sign = mode === "pull" ? -1 : 1;
    let cols = 0;
    let rows = 0;
    let w = 0;
    let h = 0;
    // Flat arrays: rest position, offset from rest, velocity.
    let rx = new Float32Array(0);
    let ry = rx;
    let ox = rx;
    let oy = rx;
    let vx = rx;
    let vy = rx;
    let raf = 0;
    let visible = true;

    const step = () => {
      const r2 = radius * radius;
      let energy = 0;
      for (let j = 0; j < rows; j++) {
        for (let i = 0; i < cols; i++) {
          const k = j * cols + i;
          const x = rx[k] + ox[k];
          const y = ry[k] + oy[k];
          // Couple to neighbours so disturbances ripple through the mesh like cloth.
          const l = i > 0 ? k - 1 : k;
          const rt = i < cols - 1 ? k + 1 : k;
          const u = j > 0 ? k - cols : k;
          const dn = j < rows - 1 ? k + cols : k;
          const nx = (ox[l] + ox[rt] + ox[u] + ox[dn]) / 4;
          const ny = (oy[l] + oy[rt] + oy[u] + oy[dn]) / 4;
          let ax = -ox[k] * stiffness + (nx - ox[k]) * 0.12;
          let ay = -oy[k] * stiffness + (ny - oy[k]) * 0.12;
          if (mouse.in) {
            const dx = x - mouse.x;
            const dy = y - mouse.y;
            const d2 = dx * dx + dy * dy;
            if (d2 < r2 && d2 > 0.01) {
              const d = Math.sqrt(d2);
              const f = (1 - d / radius) ** 2 * strength * 2.4 * sign;
              ax += (dx / d) * f;
              ay += (dy / d) * f;
            }
          }
          vx[k] = (vx[k] + ax) * damping;
          vy[k] = (vy[k] + ay) * damping;
          energy = Math.max(energy, Math.abs(vx[k]) + Math.abs(vy[k]) + (Math.abs(ox[k]) + Math.abs(oy[k])) * 0.05);
        }
      }
      for (let k = 0; k < ox.length; k++) {
        ox[k] += vx[k];
        oy[k] += vy[k];
      }
      return energy;
    };

    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      ctx.lineWidth = 1;
      const paths = Array.from({ length: BUCKETS }, () => new Path2D());
      const seg = (p: number, q: number) => {
        const stretch = Math.hypot(ox[p] + ox[q], oy[p] + oy[q]) / 2;
        const bucket = Math.min(BUCKETS - 1, Math.floor((stretch / (spacing * 0.6)) * BUCKETS));
        paths[bucket].moveTo(rx[p] + ox[p], ry[p] + oy[p]);
        paths[bucket].lineTo(rx[q] + ox[q], ry[q] + oy[q]);
      };
      for (let j = 0; j < rows; j++) {
        for (let i = 0; i < cols; i++) {
          const k = j * cols + i;
          if (i < cols - 1) seg(k, k + 1);
          if (j < rows - 1) seg(k, k + cols);
        }
      }
      paths.forEach((p, i) => {
        ctx.strokeStyle = colors[i];
        ctx.globalAlpha = 0.8 + (i / BUCKETS) * 0.2;
        ctx.stroke(p);
      });
      ctx.globalAlpha = 1;
    };

    const loop = () => {
      const energy = step();
      draw();
      // Sleep once the mesh has settled and nothing is touching it.
      raf = visible && (mouse.in || energy > 0.01) ? requestAnimationFrame(loop) : 0;
    };
    const wake = () => {
      if (!raf && visible && !reduced) raf = requestAnimationFrame(loop);
    };

    const ro = new ResizeObserver(() => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = canvas.offsetWidth;
      h = canvas.offsetHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      // One extra ring of points past each edge so the border never shows.
      cols = Math.ceil(w / spacing) + 3;
      rows = Math.ceil(h / spacing) + 3;
      const n = cols * rows;
      rx = new Float32Array(n);
      ry = new Float32Array(n);
      ox = new Float32Array(n);
      oy = new Float32Array(n);
      vx = new Float32Array(n);
      vy = new Float32Array(n);
      const x0 = (w - (cols - 1) * spacing) / 2;
      const y0 = (h - (rows - 1) * spacing) / 2;
      for (let k = 0; k < n; k++) {
        rx[k] = x0 + (k % cols) * spacing;
        ry[k] = y0 + Math.floor(k / cols) * spacing;
      }
      draw();
    });
    ro.observe(canvas);

    const pos = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect();
      mouse.x = e.clientX - r.left;
      mouse.y = e.clientY - r.top;
    };
    const onMove = (e: PointerEvent) => {
      pos(e);
      mouse.in = true;
      wake();
    };
    const onLeave = () => {
      mouse.in = false;
    };
    const onDown = (e: PointerEvent) => {
      pos(e);
      const reach = radius * 2;
      for (let k = 0; k < ox.length; k++) {
        const dx = rx[k] + ox[k] - mouse.x;
        const dy = ry[k] + oy[k] - mouse.y;
        const d = Math.hypot(dx, dy) || 1;
        if (d < reach) {
          const f = (1 - d / reach) * 16 * strength * sign;
          vx[k] += (dx / d) * f;
          vy[k] += (dy / d) * f;
        }
      }
      wake();
    };

    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible) wake();
    });
    io.observe(canvas);
    host.addEventListener("pointermove", onMove, { passive: true });
    host.addEventListener("pointerleave", onLeave);
    host.addEventListener("pointerdown", onDown);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      host.removeEventListener("pointermove", onMove);
      host.removeEventListener("pointerleave", onLeave);
      host.removeEventListener("pointerdown", onDown);
    };
  }, [spacing, radius, strength, stiffness, damping, mode, lineColor, activeColor]);

  return (
    <canvas
      ref={ref}
      aria-hidden
      className={className}
      style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none" }}
    />
  );
}
