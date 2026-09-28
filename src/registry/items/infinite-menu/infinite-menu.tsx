"use client";

import { AnimatePresence, motion } from "motion/react";
import { ArrowUpRight } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

export interface InfiniteMenuItem {
  image: string;
  title: string;
  description?: string;
  href?: string;
}

export interface InfiniteMenuProps {
  items: InfiniteMenuItem[];
  /** Number of discs on the sphere; items repeat to fill it. */
  count?: number;
  /** Disc diameter in px. */
  itemSize?: number;
  /** Slowly spin while idle instead of settling. */
  autoRotate?: boolean;
  className?: string;
}

type V3 = [number, number, number];
type M3 = number[]; // row-major 3x3

const mul = (a: M3, b: M3): M3 => {
  const o = new Array(9);
  for (let r = 0; r < 3; r++)
    for (let c = 0; c < 3; c++) o[r * 3 + c] = a[r * 3] * b[c] + a[r * 3 + 1] * b[3 + c] + a[r * 3 + 2] * b[6 + c];
  return o;
};
const apply = (m: M3, v: V3): V3 => [
  m[0] * v[0] + m[1] * v[1] + m[2] * v[2],
  m[3] * v[0] + m[4] * v[1] + m[5] * v[2],
  m[6] * v[0] + m[7] * v[1] + m[8] * v[2],
];
/** Rotation matrix around a unit axis (Rodrigues). */
const axisAngle = ([x, y, z]: V3, a: number): M3 => {
  const c = Math.cos(a);
  const s = Math.sin(a);
  const t = 1 - c;
  return [t * x * x + c, t * x * y - s * z, t * x * z + s * y, t * x * y + s * z, t * y * y + c, t * y * z - s * x, t * x * z - s * y, t * y * z + s * x, t * z * z + c];
};

/** Evenly spread points on a unit sphere (golden spiral). */
const fibonacci = (n: number): V3[] =>
  Array.from({ length: n }, (_, i) => {
    const y = 1 - ((i + 0.5) / n) * 2;
    const r = Math.sqrt(1 - y * y);
    const t = i * Math.PI * (3 - Math.sqrt(5));
    return [Math.cos(t) * r, y, Math.sin(t) * r];
  });

export function InfiniteMenu({ items, count = 42, itemSize = 84, autoRotate = false, className }: InfiniteMenuProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const discRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [active, setActive] = useState(0);
  const [moving, setMoving] = useState(false);
  const n = Math.max(items.length, Math.round(count));
  const cfg = useRef({ autoRotate });
  useEffect(() => {
    cfg.current = { autoRotate };
  }, [autoRotate]);

  useEffect(() => {
    const root = rootRef.current!;
    const pts = fibonacci(n);
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let m: M3 = [1, 0, 0, 0, 1, 0, 0, 0, 1];
    let omega: V3 = [0, 0, 0]; // angular velocity, axis * rad/s
    let target = -1; // disc index to bring to front (keyboard)
    let drag: { x: number; y: number; t: number } | null = null;
    let raf = 0;
    let last = 0;
    let visible = true;
    let front = -1;
    let isMoving = false;

    const radius = () => Math.min(root.clientWidth, root.clientHeight) * 0.36;
    const setMovingOnce = (v: boolean) => {
      if (v === isMoving) return;
      isMoving = v;
      setMoving(v);
    };

    const rotate = (axis: V3, angle: number) => {
      const len = Math.hypot(...axis);
      if (len < 1e-9 || !angle) return;
      m = mul(axisAngle([axis[0] / len, axis[1] / len, axis[2] / len], angle), m);
    };

    const render = () => {
      const R = radius();
      let best = 0;
      let bestZ = -2;
      for (let i = 0; i < n; i++) {
        const [x, y, z] = apply(m, pts[i]);
        if (z > bestZ) {
          bestZ = z;
          best = i;
        }
        const el = discRefs.current[i];
        if (!el) continue;
        // Billboard squashed along the radial direction: reads as a disc on a sphere.
        const theta = Math.atan2(y, x);
        const squash = Math.max(0.25, Math.abs(z));
        const depth = (z + 1) / 2;
        el.style.transform = `translate3d(${x * R}px,${y * R}px,${z * R}px) rotate(${theta}rad) scaleX(${squash}) rotate(${-theta}rad)`;
        el.style.opacity = String(0.12 + depth * 0.88);
        el.style.zIndex = String(Math.round(z * 1000) + 1000);
        el.style.filter = z < 0 ? `blur(${(-z * 3).toFixed(1)}px) grayscale(.6)` : "none";
      }
      if (best !== front) {
        front = best;
        setActive(best % items.length);
        discRefs.current.forEach((el, i) => el?.toggleAttribute("data-front", i === best));
      }
      return best;
    };

    const tick = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000 || 0.016);
      last = now;
      let settled = false;
      if (!drag) {
        const speed = Math.hypot(...omega);
        if (speed > 0.05) {
          rotate(omega, speed * dt);
          const k = Math.exp(-dt * 2.5);
          omega = [omega[0] * k, omega[1] * k, omega[2] * k];
        } else if (cfg.current.autoRotate && !reduced && target < 0) {
          rotate([0, 1, 0], 0.18 * dt);
        } else {
          // Settle: swing the chosen disc to dead center.
          omega = [0, 0, 0];
          const i = target >= 0 ? target : front;
          const q = apply(m, pts[Math.max(0, i)]);
          const angle = Math.acos(Math.max(-1, Math.min(1, q[2])));
          if (angle < 0.002) settled = true;
          else rotate([q[1], -q[0], 0], reduced ? angle : angle * (1 - Math.exp(-dt * 9)));
          if (settled) target = -1;
        }
      }
      render();
      setMovingOnce(!!drag || Math.hypot(...omega) > 0.4);
      raf = visible && !settled ? requestAnimationFrame(tick) : 0;
    };
    const wake = () => {
      if (raf || !visible) return;
      last = performance.now();
      raf = requestAnimationFrame(tick);
    };

    const onDown = (e: PointerEvent) => {
      root.setPointerCapture(e.pointerId);
      drag = { x: e.clientX, y: e.clientY, t: performance.now() };
      omega = [0, 0, 0];
      target = -1;
      wake();
    };
    const onMove = (e: PointerEvent) => {
      if (!drag) return;
      const now = performance.now();
      const dx = e.clientX - drag.x;
      const dy = e.clientY - drag.y;
      const angle = Math.hypot(dx, dy) / radius();
      rotate([-dy, dx, 0], angle);
      const dts = Math.max(0.008, (now - drag.t) / 1000);
      const blend = 0.6;
      omega = [
        omega[0] * (1 - blend) + ((-dy / radius()) / dts) * blend,
        omega[1] * (1 - blend) + ((dx / radius()) / dts) * blend,
        0,
      ];
      drag = { x: e.clientX, y: e.clientY, t: now };
    };
    const onUp = () => {
      if (drag && performance.now() - drag.t > 80) omega = [0, 0, 0]; // held still before letting go
      drag = null;
      wake();
    };
    const onKey = (e: KeyboardEvent) => {
      const dir: Record<string, [number, number]> = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] };
      const d = dir[e.key];
      if (!d) return;
      e.preventDefault();
      // Nearest front-facing disc in the pressed direction.
      let best = -1;
      let bestScore = Infinity;
      for (let i = 0; i < n; i++) {
        if (i === front) continue;
        const [x, y, z] = apply(m, pts[i]);
        const along = x * d[0] + y * d[1];
        if (z < 0 || along < 0.12) continue;
        const score = Math.hypot(x, y) + Math.abs(x * d[1] - y * d[0]) * 1.5;
        if (score < bestScore) {
          bestScore = score;
          best = i;
        }
      }
      if (best >= 0) {
        target = best;
        omega = [0, 0, 0];
        wake();
      }
    };

    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible) wake();
    });
    const ro = new ResizeObserver(() => render());
    io.observe(root);
    ro.observe(root);
    root.addEventListener("pointerdown", onDown);
    root.addEventListener("pointermove", onMove);
    root.addEventListener("pointerup", onUp);
    root.addEventListener("pointercancel", onUp);
    root.addEventListener("keydown", onKey);
    // Start with a little spin so the sphere reads as 3D right away.
    omega = reduced ? [0, 0, 0] : [0.3, 2.4, 0];
    wake();
    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      ro.disconnect();
      root.removeEventListener("pointerdown", onDown);
      root.removeEventListener("pointermove", onMove);
      root.removeEventListener("pointerup", onUp);
      root.removeEventListener("pointercancel", onUp);
      root.removeEventListener("keydown", onKey);
    };
  }, [n, items.length]);

  const item = items[active];

  return (
    <div className={cn("relative h-full w-full overflow-hidden", className)}>
      <div
        ref={rootRef}
        tabIndex={0}
        role="group"
        aria-roledescription="sphere menu"
        aria-label="Drag or use the arrow keys to spin."
        className="absolute inset-0 cursor-grab touch-none select-none outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring active:cursor-grabbing"
        style={{ perspective: 1100 }}
      >
        <div className="absolute left-1/2 top-1/2" style={{ transformStyle: "preserve-3d" }}>
          {Array.from({ length: n }, (_, i) => {
            const it = items[i % items.length];
            return (
              <div
                key={i}
                ref={(el) => {
                  discRefs.current[i] = el;
                }}
                aria-hidden
                className="absolute overflow-hidden rounded-full bg-muted ring-1 ring-white/10 transition-[box-shadow] duration-300 will-change-transform data-[front]:shadow-[0_0_0_3px_var(--primary),0_0_40px_-4px_var(--primary)]"
                style={{ width: itemSize, height: itemSize, left: -itemSize / 2, top: -itemSize / 2 }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={it.image} alt="" draggable={false} className="size-full object-cover" />
              </div>
            );
          })}
        </div>
      </div>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 p-6 sm:p-8">
        <AnimatePresence mode="wait">
          {!moving && item && (
            <motion.div
              key={active}
              role="status"
              initial={{ opacity: 0, y: 12, filter: "blur(6px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: -8, filter: "blur(6px)" }}
              transition={{ duration: 0.35, ease: [0.2, 0.7, 0.2, 1] }}
              className="max-w-sm"
            >
              <p className="text-3xl font-semibold tracking-tight text-foreground sm:text-5xl">{item.title}</p>
              {item.description && <p className="mt-2 text-sm text-muted-foreground">{item.description}</p>}
            </motion.div>
          )}
        </AnimatePresence>
        {item?.href && (
          <motion.a
            href={item.href}
            aria-label={`Open ${item.title}`}
            animate={{ scale: moving ? 0 : 1, opacity: moving ? 0 : 1 }}
            transition={{ type: "spring", stiffness: 400, damping: 22 }}
            className="pointer-events-auto grid size-14 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground outline-none ring-ring ring-offset-2 ring-offset-background focus-visible:ring-2"
          >
            <ArrowUpRight className="size-6" />
          </motion.a>
        )}
      </div>
    </div>
  );
}
