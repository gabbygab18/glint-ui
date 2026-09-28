"use client";

import { useEffect, useRef, type PointerEvent, type ReactNode } from "react";
import { cn } from "@/lib/utils";

export type StickerCorner = "bottom-right" | "bottom-left" | "top-right" | "top-left";

export interface StickerPeelProps {
  /** The sticker face. Should fill the box. */
  children: ReactNode;
  /** Corner that lifts. */
  corner?: StickerCorner;
  /** Px the corner is lifted at rest, as a hint. */
  restPeel?: number;
  /** Px the corner lifts on hover or focus. */
  hoverPeel?: number;
  /** Color of the sticker's paper back. */
  backColor?: string;
  /** Corner radius of the sticker in px; match your face. */
  radius?: number;
  /** Accessible name. */
  label?: string;
  className?: string;
}

type Pt = [number, number];

// Keep the part of a polygon where side(p) >= 0 (one Sutherland–Hodgman pass).
function clip(poly: Pt[], side: (p: Pt) => number) {
  const out: Pt[] = [];
  poly.forEach((a, i) => {
    const b = poly[(i + 1) % poly.length];
    const fa = side(a);
    const fb = side(b);
    if (fa >= 0) out.push(a);
    if (fa >= 0 !== fb >= 0) {
      const t = fa / (fa - fb);
      out.push([a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t]);
    }
  });
  return out;
}

const poly = (pts: Pt[]) => (pts.length < 3 ? "polygon(0 0)" : `polygon(${pts.map(([x, y]) => `${x}px ${y}px`).join(",")})`);

export function StickerPeel({
  children,
  corner = "bottom-right",
  restPeel = 18,
  hoverPeel = 90,
  backColor = "#f4f4f5",
  radius = 28,
  label = "Sticker. Press Enter to peel",
  className,
}: StickerPeelProps) {
  const root = useRef<HTMLDivElement>(null);
  const face = useRef<HTMLDivElement>(null);
  const flap = useRef<HTMLDivElement>(null);
  const api = useRef<{ hover: (on: boolean) => void; drag: (x: number, y: number) => void; release: () => void; toggle: () => void }>(null);

  useEffect(() => {
    const el = root.current!;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const cornerPt = (): Pt => [corner.includes("right") ? el.offsetWidth : 0, corner.includes("bottom") ? el.offsetHeight : 0];
    // A point `amount` px in from the corner along the diagonal.
    const inset = (amount: number): Pt => {
      const [cx, cy] = cornerPt();
      const dx = el.offsetWidth / 2 - cx;
      const dy = el.offsetHeight / 2 - cy;
      const l = Math.hypot(dx, dy);
      return [cx + (dx / l) * amount, cy + (dy / l) * amount];
    };

    let p = inset(restPeel);
    let target = p;
    let hovering = false;
    let dragging = false;
    let open = false;
    let raf = 0;

    const render = () => {
      if (!face.current || !flap.current) return; // unmounted
      const W = el.offsetWidth;
      const H = el.offsetHeight;
      const [cx, cy] = cornerPt();
      const len = Math.hypot(cx - p[0], cy - p[1]);
      const rect: Pt[] = [[0, 0], [W, 0], [W, H], [0, H]];
      if (len < 0.5) {
        face.current!.style.clipPath = "";
        flap.current!.style.clipPath = "polygon(0 0)";
        return;
      }
      // The fold is the perpendicular bisector between the corner and where it is pulled to.
      const nx = (cx - p[0]) / len;
      const ny = (cy - p[1]) / len;
      const k = ((cx + p[0]) / 2) * nx + ((cy + p[1]) / 2) * ny;
      face.current!.style.clipPath = poly(clip(rect, ([x, y]) => k - (x * nx + y * ny)));
      const f = flap.current!;
      f.style.clipPath = poly(clip(rect, ([x, y]) => x * nx + y * ny - k));
      // Mirror the folded part across the fold line.
      f.style.transform = `matrix(${1 - 2 * nx * nx},${-2 * nx * ny},${-2 * nx * ny},${1 - 2 * ny * ny},${2 * k * nx},${2 * k * ny})`;
      // Shade the back: dark crease at the fold, a highlight just past it, soft falloff to the tip.
      const L = Math.abs(W * nx) + Math.abs(H * ny);
      const c = (W / 2) * nx + (H / 2) * ny;
      const tf = ((k - c) / L + 0.5) * 100;
      const tc = ((cx * nx + cy * ny - c) / L + 0.5) * 100;
      const at = (s: number) => `${tf + (tc - tf) * s}%`;
      const angle = (Math.atan2(nx, -ny) * 180) / Math.PI;
      f.style.backgroundImage = `linear-gradient(${angle}deg, rgba(0,0,0,.28) ${at(0)}, rgba(255,255,255,.7) ${at(0.12)}, rgba(255,255,255,0) ${at(0.5)}, rgba(0,0,0,.14) ${at(1)})`;
    };

    const tick = () => {
      const ease = dragging ? 0.45 : 0.16;
      p = [p[0] + (target[0] - p[0]) * ease, p[1] + (target[1] - p[1]) * ease];
      render();
      raf = Math.hypot(target[0] - p[0], target[1] - p[1]) > 0.3 ? requestAnimationFrame(tick) : 0;
    };
    const go = (t: Pt) => {
      target = t;
      if (reduced) {
        p = t;
        render();
      } else if (!raf) raf = requestAnimationFrame(tick);
    };
    const settle = () => go(inset(open ? Math.min(el.offsetWidth, el.offsetHeight) * 0.7 : hovering ? hoverPeel : restPeel));

    api.current = {
      hover: (on) => {
        hovering = on;
        if (!dragging) settle();
      },
      drag: (x, y) => {
        dragging = true;
        const [cx, cy] = cornerPt();
        const max = Math.max(el.offsetWidth, el.offsetHeight) * 1.6;
        const d = Math.hypot(x - cx, y - cy);
        const s = d > max ? max / d : 1;
        go([cx + (x - cx) * s, cy + (y - cy) * s]);
      },
      release: () => {
        dragging = false;
        settle();
      },
      toggle: () => {
        open = !open;
        settle();
      },
    };

    const ro = new ResizeObserver(() => {
      p = target = inset(restPeel);
      render();
    });
    ro.observe(el);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      api.current = null;
    };
  }, [corner, restPeel, hoverPeel]);

  const local = (e: PointerEvent) => {
    const r = root.current!.getBoundingClientRect();
    return [e.clientX - r.left, e.clientY - r.top] as const;
  };

  return (
    <div
      ref={root}
      role="button"
      aria-label={label}
      tabIndex={0}
      className={cn(
        "relative inline-block cursor-grab touch-none select-none outline-none focus-visible:ring-2 focus-visible:ring-ring active:cursor-grabbing",
        className,
      )}
      style={{ borderRadius: radius }}
      onPointerEnter={() => api.current?.hover(true)}
      onPointerLeave={() => api.current?.hover(false)}
      onPointerDown={(e) => {
        e.currentTarget.setPointerCapture(e.pointerId);
        api.current?.drag(...local(e));
      }}
      onPointerMove={(e) => e.buttons & 1 && api.current?.drag(...local(e))}
      onPointerUp={() => api.current?.release()}
      onPointerCancel={() => api.current?.release()}
      onFocus={() => api.current?.hover(true)}
      onBlur={() => api.current?.hover(false)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          api.current?.toggle();
        }
      }}
    >
      <div style={{ filter: "drop-shadow(0 6px 10px rgba(0,0,0,.35))" }}>
        <div ref={face}>{children}</div>
      </div>
      <div aria-hidden className="pointer-events-none absolute inset-0" style={{ filter: "drop-shadow(0 10px 14px rgba(0,0,0,.4))" }}>
        <div
          ref={flap}
          className="absolute inset-0"
          style={{ borderRadius: radius, backgroundColor: backColor, transformOrigin: "0 0", clipPath: "polygon(0 0)" }}
        />
      </div>
    </div>
  );
}
