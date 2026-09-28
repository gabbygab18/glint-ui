"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface LanyardProps {
  /** Name printed on the badge. */
  name?: string;
  /** Role printed under the name. */
  role?: string;
  /** Photo URL for the badge. */
  image?: string;
  /** Replace the default badge face entirely. */
  children?: ReactNode;
  /** Strap color. */
  strapColor?: string;
  /** Strap length in px. */
  ropeLength?: number;
  /** Badge width in px (height follows a 1:1.45 ratio). */
  badgeWidth?: number;
  /** Gravity multiplier. */
  gravity?: number;
  className?: string;
}

type P = { x: number; y: number; px: number; py: number };

const SEGMENTS = 14;
const ITERATIONS = 14;

export function Lanyard({
  name = "Ada Park",
  role = "Design Engineer",
  image,
  children,
  strapColor = "#c6f24e",
  ropeLength = 170,
  badgeWidth = 180,
  gravity = 1,
  className,
}: LanyardProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const badgeRef = useRef<HTMLButtonElement>(null);
  const cfg = useRef({ strapColor, gravity });
  useEffect(() => {
    cfg.current = { strapColor, gravity };
  }, [strapColor, gravity]);

  const badgeHeight = badgeWidth * 1.45;

  useEffect(() => {
    const root = rootRef.current!;
    const canvas = canvasRef.current!;
    const badge = badgeRef.current!;
    const ctx = canvas.getContext("2d")!;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const seg = ropeLength / SEGMENTS;
    let w = root.clientWidth;
    let h = root.clientHeight;
    const anchor = () => ({ x: w / 2, y: -8 });

    // Rope nodes; the last node is the badge clip. `tail` is the badge bottom.
    const a0 = anchor();
    // Start tilted to one side so it swings in on mount.
    const phi = reduced ? 0 : 0.75;
    const [sx, sy] = [Math.sin(phi), Math.cos(phi)];
    const pts: P[] = Array.from({ length: SEGMENTS + 1 }, (_, i) => {
      const x = a0.x + sx * seg * i;
      const y = a0.y + sy * seg * i;
      return { x, y, px: x, py: y };
    });
    const clip = pts[SEGMENTS];
    const tx = clip.x + sx * badgeHeight;
    const ty = clip.y + sy * badgeHeight;
    const tail: P = { x: tx, y: ty, px: tx, py: ty };
    let grab: { f: number; x: number; y: number } | null = null;
    let raf = 0;
    let visible = true;
    let last = performance.now();
    let acc = 0;

    const dist = (a: P, b: P, len: number, wa: number, wb: number) => {
      const dx = b.x - a.x;
      const dy = b.y - a.y;
      const d = Math.hypot(dx, dy) || 1e-6;
      const diff = (d - len) / d / (wa + wb);
      a.x += dx * diff * wa;
      a.y += dy * diff * wa;
      b.x -= dx * diff * wb;
      b.y -= dy * diff * wb;
    };

    const step = (dt: number) => {
      const g = 2200 * cfg.current.gravity * dt * dt;
      for (const p of [...pts, tail]) {
        const vx = (p.x - p.px) * 0.985;
        const vy = (p.y - p.py) * 0.985;
        p.px = p.x;
        p.py = p.y;
        p.x += vx;
        p.y += vy + g;
      }
      const a = anchor();
      for (let k = 0; k < ITERATIONS; k++) {
        pts[0].x = a.x;
        pts[0].y = a.y;
        for (let i = 0; i < SEGMENTS; i++) dist(pts[i], pts[i + 1], seg, i === 0 ? 0 : 1, i + 1 === SEGMENTS ? 0.35 : 1);
        dist(clip, tail, badgeHeight, 1, 1);
        if (grab) {
          // Move the grabbed point on the badge to the pointer, split between both ends.
          const f = grab.f;
          const cx = grab.x - (clip.x + (tail.x - clip.x) * f);
          const cy = grab.y - (clip.y + (tail.y - clip.y) * f);
          const s = (1 - f) * (1 - f) + f * f;
          clip.x += (cx * (1 - f)) / s;
          clip.y += (cy * (1 - f)) / s;
          tail.x += (cx * f) / s;
          tail.y += (cy * f) / s;
        }
      }
      pts[0].x = a.x;
      pts[0].y = a.y;
    };

    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      const trace = () => {
        ctx.beginPath();
        ctx.moveTo(pts[0].x, pts[0].y);
        for (let i = 1; i < SEGMENTS; i++) {
          const mx = (pts[i].x + pts[i + 1].x) / 2;
          const my = (pts[i].y + pts[i + 1].y) / 2;
          ctx.quadraticCurveTo(pts[i].x, pts[i].y, mx, my);
        }
        ctx.lineTo(clip.x, clip.y);
      };
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.save();
      ctx.shadowColor = "rgba(0,0,0,.45)";
      ctx.shadowBlur = 14;
      ctx.shadowOffsetY = 6;
      trace();
      ctx.strokeStyle = cfg.current.strapColor;
      ctx.lineWidth = 14;
      ctx.stroke();
      ctx.restore();
      // Woven look: darker edges and a stitched center line.
      trace();
      ctx.strokeStyle = "rgba(0,0,0,.18)";
      ctx.lineWidth = 14;
      ctx.setLineDash([2, 3]);
      ctx.stroke();
      trace();
      ctx.strokeStyle = cfg.current.strapColor;
      ctx.lineWidth = 9;
      ctx.setLineDash([]);
      ctx.stroke();
      trace();
      ctx.strokeStyle = "rgba(255,255,255,.35)";
      ctx.lineWidth = 1.2;
      ctx.setLineDash([5, 4]);
      ctx.stroke();
      ctx.setLineDash([]);

      const ang = Math.atan2(tail.x - clip.x, tail.y - clip.y);
      const vx = clip.x - clip.px;
      const flip = Math.max(-35, Math.min(35, vx * 2.2));
      badge.style.transform = `translate3d(${clip.x - badgeWidth / 2}px, ${clip.y - 10}px, 0) rotate(${-ang}rad) rotateY(${flip}deg)`;
    };

    const frame = (now: number) => {
      acc += Math.min(0.05, (now - last) / 1000);
      last = now;
      const dt = 1 / 120;
      while (acc >= dt) {
        step(dt);
        acc -= dt;
      }
      draw();
      raf = visible ? requestAnimationFrame(frame) : 0;
    };
    const start = () => {
      if (raf || !visible) return;
      last = performance.now();
      raf = requestAnimationFrame(frame);
    };

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = root.clientWidth;
      h = root.clientHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      draw();
    };

    const local = (e: PointerEvent) => {
      const r = root.getBoundingClientRect();
      return { x: e.clientX - r.left, y: e.clientY - r.top };
    };
    const onDown = (e: PointerEvent) => {
      badge.setPointerCapture(e.pointerId);
      const p = local(e);
      // Project the pointer onto the badge axis to find where it was grabbed.
      const ax = tail.x - clip.x;
      const ay = tail.y - clip.y;
      const f = Math.max(0.05, Math.min(0.95, ((p.x - clip.x) * ax + (p.y - clip.y) * ay) / (ax * ax + ay * ay)));
      grab = { f, ...p };
    };
    const onMove = (e: PointerEvent) => {
      if (grab) Object.assign(grab, local(e));
    };
    const onUp = () => {
      grab = null;
    };
    const onKey = (e: KeyboardEvent) => {
      const push: Record<string, [number, number]> = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1], Enter: [1, -0.4], " ": [-1, -0.4] };
      const d = push[e.key];
      if (!d) return;
      e.preventDefault();
      // Nudge by faking velocity: shift the previous positions backwards.
      for (const p of [tail, clip]) {
        p.px -= d[0] * 14;
        p.py -= d[1] * 14;
      }
    };

    const ro = new ResizeObserver(resize);
    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible) start();
    });
    ro.observe(root);
    io.observe(root);
    badge.addEventListener("pointerdown", onDown);
    badge.addEventListener("pointermove", onMove);
    badge.addEventListener("pointerup", onUp);
    badge.addEventListener("pointercancel", onUp);
    badge.addEventListener("keydown", onKey);
    resize();
    start();
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      badge.removeEventListener("pointerdown", onDown);
      badge.removeEventListener("pointermove", onMove);
      badge.removeEventListener("pointerup", onUp);
      badge.removeEventListener("pointercancel", onUp);
      badge.removeEventListener("keydown", onKey);
    };
  }, [ropeLength, badgeWidth, badgeHeight]);

  return (
    <div ref={rootRef} className={cn("relative h-full w-full overflow-hidden", className)} style={{ perspective: 900 }}>
      <canvas ref={canvasRef} aria-hidden className="pointer-events-none absolute inset-0 size-full" />
      <button
        ref={badgeRef}
        type="button"
        aria-label={`${name}, ${role}. Drag to swing, or press the arrow keys.`}
        className="absolute left-0 top-0 cursor-grab touch-none select-none rounded-2xl text-left outline-none will-change-transform focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-4 focus-visible:ring-offset-background active:cursor-grabbing"
        style={{ width: badgeWidth, height: badgeHeight, transformOrigin: "50% 10px" }}
      >
        {/* metal clip */}
        <span aria-hidden className="absolute -top-3 left-1/2 z-10 h-7 w-6 -translate-x-1/2 rounded-md border-2 border-zinc-300 bg-gradient-to-b from-zinc-200 to-zinc-500 shadow-md" />
        <span className="flex size-full flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-[0_30px_60px_-15px_rgba(0,0,0,.6)]">
          {children ?? (
            <>
              <span className="relative block h-[22%] shrink-0" style={{ background: `linear-gradient(135deg, ${strapColor}, color-mix(in oklab, ${strapColor} 55%, black))` }}>
                <span className="absolute left-1/2 top-[18%] h-[14%] w-[22%] -translate-x-1/2 rounded-full bg-card/90" />
                <span className="absolute bottom-[14%] right-[8%] font-mono text-[0.6rem] font-bold uppercase tracking-[0.25em] text-black/70">Visitor pass</span>
              </span>
              <span className="relative -mt-[14%] ml-[10%] block aspect-square w-[46%] shrink-0 overflow-hidden rounded-xl border-4 border-card bg-muted">
                {image && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={image} alt="" draggable={false} className="size-full object-cover" />
                )}
              </span>
              <span className="block px-[10%] pt-3">
                <span className="block truncate text-lg font-semibold leading-tight text-foreground">{name}</span>
                <span className="block truncate text-xs text-muted-foreground">{role}</span>
              </span>
              <span aria-hidden className="grid grid-cols-2 gap-2 px-[10%] pt-3 font-mono text-[0.55rem] uppercase tracking-wider text-muted-foreground">
                <span>
                  ID<span className="block text-[0.7rem] text-foreground">0427</span>
                </span>
                <span>
                  Access<span className="block text-[0.7rem] text-foreground">All areas</span>
                </span>
              </span>
              <span aria-hidden className="mt-auto flex h-[12%] items-end gap-[3px] px-[10%] pb-[9%]">
                {Array.from({ length: 22 }, (_, i) => (
                  <span key={i} className="h-full bg-foreground/80" style={{ width: (i * 7) % 3 === 0 ? 3 : 1 }} />
                ))}
              </span>
            </>
          )}
        </span>
      </button>
    </div>
  );
}
