"use client";

import { useEffect, useRef, type KeyboardEvent, type PointerEvent, type ReactNode } from "react";
import { Minus, Plus, Scan } from "lucide-react";

export interface CanvasItem {
  id: string;
  /** Center of the item in world px (0,0 is the middle of the canvas). */
  x: number;
  y: number;
  content: ReactNode;
}

export interface InfiniteCanvasProps {
  items: CanvasItem[];
  /** World width in px; panning stops at its edges. */
  worldWidth?: number;
  /** World height in px. */
  worldHeight?: number;
  /** Zoom at first render and on reset. */
  defaultZoom?: number;
  minZoom?: number;
  maxZoom?: number;
  /** Px between grid dots at 100% zoom. */
  gridGap?: number;
  /** Dot radius in px. */
  dotSize?: number;
  /** Glide after a flick. */
  inertia?: boolean;
  /** Show the zoom buttons. */
  showControls?: boolean;
  /** Accessible name for the canvas. */
  label?: string;
  className?: string;
}

const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));

/**
 * A bounded, pannable and zoomable board. Drag to pan (with inertia), scroll or pinch to zoom
 * around the pointer, or use arrows / + / - / 0 when focused. The camera lives in refs and is
 * written straight to the DOM, so panning never re-renders React.
 */
export function InfiniteCanvas({
  items,
  worldWidth = 2400,
  worldHeight = 1600,
  defaultZoom = 0.8,
  minZoom = 0.3,
  maxZoom = 2.5,
  gridGap = 24,
  dotSize = 1.1,
  inertia = true,
  showControls = true,
  label = "Canvas",
  className,
}: InfiniteCanvasProps) {
  const root = useRef<HTMLDivElement>(null);
  const layer = useRef<HTMLDivElement>(null);
  const zoomText = useRef<HTMLSpanElement>(null);
  // Camera: pan offset from the viewport center (px) and zoom.
  const cam = useRef({ x: 0, y: 0, z: defaultZoom });
  const size = useRef({ w: 0, h: 0 });
  const raf = useRef(0);
  const pointers = useRef(new Map<number, { x: number; y: number }>());
  const drag = useRef({ vx: 0, vy: 0, t: 0, pinch: 0 });
  const opts = useRef({ worldWidth, worldHeight, minZoom, maxZoom, gridGap, dotSize });
  useEffect(() => {
    opts.current = { worldWidth, worldHeight, minZoom, maxZoom, gridGap, dotSize };
  });

  const apply = () => {
    const el = root.current;
    const l = layer.current;
    if (!el || !l) return;
    const o = opts.current;
    const c = cam.current;
    c.z = clamp(c.z, o.minZoom, o.maxZoom);
    // Keep the viewport center inside the world.
    c.x = clamp(c.x, (-o.worldWidth / 2) * c.z, (o.worldWidth / 2) * c.z);
    c.y = clamp(c.y, (-o.worldHeight / 2) * c.z, (o.worldHeight / 2) * c.z);
    const ox = size.current.w / 2 + c.x;
    const oy = size.current.h / 2 + c.y;
    l.style.transform = `translate3d(${ox}px, ${oy}px, 0) scale(${c.z})`;
    const g = o.gridGap * c.z;
    el.style.backgroundSize = `${g}px ${g}px`;
    el.style.backgroundPosition = `${ox}px ${oy}px`;
    el.style.setProperty("--ic-dot", `${Math.max(0.6, o.dotSize * Math.sqrt(c.z))}px`);
    if (zoomText.current) zoomText.current.textContent = `${Math.round(c.z * 100)}%`;
  };

  /** Zoom to `z`, keeping the screen point (px, py) (relative to the viewport center) fixed. */
  const zoomAt = (px: number, py: number, z: number) => {
    const c = cam.current;
    const nz = clamp(z, opts.current.minZoom, opts.current.maxZoom);
    c.x = px - ((px - c.x) / c.z) * nz;
    c.y = py - ((py - c.y) / c.z) * nz;
    c.z = nz;
    apply();
  };

  const stop = () => cancelAnimationFrame(raf.current);

  /** Ease the camera to a target (buttons, keys). */
  const tween = (to: { x?: number; y?: number; z?: number }, ms = 320) => {
    stop();
    const from = { ...cam.current };
    const target = { x: to.x ?? from.x, y: to.y ?? from.y, z: to.z ?? from.z };
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) ms = 0;
    const t0 = performance.now();
    const tick = (now: number) => {
      const k = ms ? Math.min(1, (now - t0) / ms) : 1;
      const e = 1 - Math.pow(1 - k, 3);
      // Interpolate zoom around the viewport center, pan linearly.
      const z = from.z + (target.z - from.z) * e;
      cam.current = { x: from.x + (target.x - from.x) * e, y: from.y + (target.y - from.y) * e, z };
      apply();
      if (k < 1) raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
  };

  const zoomBy = (f: number) => {
    const c = cam.current;
    const z = clamp(c.z * f, opts.current.minZoom, opts.current.maxZoom);
    tween({ z, x: (c.x / c.z) * z, y: (c.y / c.z) * z });
  };

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => {
      size.current = { w: e.contentRect.width, h: e.contentRect.height };
      apply();
    });
    ro.observe(el);
    // Non-passive so the page does not scroll while zooming the canvas.
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      stop();
      const r = el.getBoundingClientRect();
      // Pinch on trackpads arrives as ctrl+wheel with small deltas.
      const k = e.ctrlKey ? 0.01 : 0.0015;
      const d = e.deltaMode === 1 ? e.deltaY * 16 : e.deltaY;
      zoomAt(e.clientX - r.left - r.width / 2, e.clientY - r.top - r.height / 2, cam.current.z * Math.exp(-d * k));
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => {
      ro.disconnect();
      el.removeEventListener("wheel", onWheel);
      cancelAnimationFrame(raf.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onDown = (e: PointerEvent<HTMLDivElement>) => {
    if ((e.target as Element).closest("[data-canvas-ui]")) return;
    stop();
    e.currentTarget.setPointerCapture(e.pointerId);
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    drag.current = { vx: 0, vy: 0, t: performance.now(), pinch: 0 };
    e.currentTarget.dataset.grabbing = "";
  };

  const onMove = (e: PointerEvent<HTMLDivElement>) => {
    const ps = pointers.current;
    const prev = ps.get(e.pointerId);
    if (!prev) return;
    const c = cam.current;
    if (ps.size === 2) {
      const other = [...ps.entries()].find(([id]) => id !== e.pointerId)![1];
      const dist = Math.hypot(e.clientX - other.x, e.clientY - other.y);
      const r = e.currentTarget.getBoundingClientRect();
      const mx = (e.clientX + other.x) / 2 - r.left - r.width / 2;
      const my = (e.clientY + other.y) / 2 - r.top - r.height / 2;
      if (drag.current.pinch) zoomAt(mx, my, c.z * (dist / drag.current.pinch));
      drag.current.pinch = dist;
    } else {
      const dx = e.clientX - prev.x;
      const dy = e.clientY - prev.y;
      const now = performance.now();
      const dt = Math.max(1, now - drag.current.t);
      // Smoothed velocity in px/ms for the release glide.
      drag.current.vx = drag.current.vx * 0.6 + (dx / dt) * 0.4;
      drag.current.vy = drag.current.vy * 0.6 + (dy / dt) * 0.4;
      drag.current.t = now;
      c.x += dx;
      c.y += dy;
      apply();
    }
    ps.set(e.pointerId, { x: e.clientX, y: e.clientY });
  };

  const onUp = (e: PointerEvent<HTMLDivElement>) => {
    const ps = pointers.current;
    if (!ps.delete(e.pointerId)) return;
    drag.current.pinch = 0;
    if (ps.size) return;
    delete e.currentTarget.dataset.grabbing;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!inertia || reduce || performance.now() - drag.current.t > 80) return;
    let { vx, vy } = drag.current;
    let last = performance.now();
    const glide = (now: number) => {
      const dt = now - last;
      last = now;
      cam.current.x += vx * dt;
      cam.current.y += vy * dt;
      const decay = Math.pow(0.994, dt);
      vx *= decay;
      vy *= decay;
      apply();
      if (Math.hypot(vx, vy) > 0.02) raf.current = requestAnimationFrame(glide);
    };
    raf.current = requestAnimationFrame(glide);
  };

  const onKey = (e: KeyboardEvent<HTMLDivElement>) => {
    const c = cam.current;
    const step = 80;
    const pan: Record<string, [number, number]> = { ArrowLeft: [step, 0], ArrowRight: [-step, 0], ArrowUp: [0, step], ArrowDown: [0, -step] };
    if (e.key in pan) tween({ x: c.x + pan[e.key][0], y: c.y + pan[e.key][1] }, 200);
    else if (e.key === "+" || e.key === "=") zoomBy(1.25);
    else if (e.key === "-" || e.key === "_") zoomBy(0.8);
    else if (e.key === "0") tween({ x: 0, y: 0, z: defaultZoom });
    else return;
    e.preventDefault();
  };

  const btn =
    "grid size-8 place-items-center rounded-lg text-muted-foreground outline-none transition-colors hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring [&>svg]:size-4";

  return (
    <div
      ref={root}
      role="region"
      aria-roledescription="canvas"
      aria-label={`${label}. Drag or use arrow keys to pan, scroll or plus and minus to zoom, 0 to reset.`}
      tabIndex={0}
      onPointerDown={onDown}
      onPointerMove={onMove}
      onPointerUp={onUp}
      onPointerCancel={onUp}
      onKeyDown={onKey}
      className={`relative size-full cursor-grab touch-none select-none overflow-hidden bg-background outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring data-[grabbing]:cursor-grabbing ${className ?? ""}`}
      style={{
        backgroundImage: "radial-gradient(circle, color-mix(in srgb, var(--foreground) 22%, transparent) var(--ic-dot, 1px), transparent calc(var(--ic-dot, 1px) + .5px))",
      }}
    >
      <div ref={layer} className="absolute left-0 top-0 origin-top-left">
        {items.map((it) => (
          <div key={it.id} className="absolute -translate-x-1/2 -translate-y-1/2" style={{ left: it.x, top: it.y }}>
            {it.content}
          </div>
        ))}
      </div>

      {showControls && (
        <div
          data-canvas-ui
          className="absolute bottom-4 right-4 flex items-center gap-0.5 rounded-xl border border-border bg-card/85 p-1 shadow-lg backdrop-blur"
        >
          <button type="button" aria-label="Zoom out" className={btn} onClick={() => zoomBy(0.8)}>
            <Minus />
          </button>
          <span ref={zoomText} className="w-12 text-center font-mono text-xs tabular-nums text-foreground">
            {Math.round(defaultZoom * 100)}%
          </span>
          <button type="button" aria-label="Zoom in" className={btn} onClick={() => zoomBy(1.25)}>
            <Plus />
          </button>
          <button type="button" aria-label="Reset view" className={btn} onClick={() => tween({ x: 0, y: 0, z: defaultZoom })}>
            <Scan />
          </button>
        </div>
      )}
    </div>
  );
}
