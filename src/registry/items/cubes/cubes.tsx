"use client";

import { useEffect, useRef } from "react";

export interface CubesProps {
  /** Cubes per row and column. */
  grid?: number;
  /** Max tilt in degrees. */
  maxAngle?: number;
  /** Radius of the cursor's influence, in cells. */
  radius?: number;
  /** Gap between cubes in px. */
  gap?: number;
  /** Color the cubes flash as a ripple passes. */
  rippleColor?: string;
  /** Ripple travel speed multiplier. */
  rippleSpeed?: number;
  /** Wander and ripple on their own while the pointer is away. */
  autoAnimate?: boolean;
  className?: string;
}

// Face transform + a shade so the sides read darker than the front.
const FACES: [string, number][] = [
  ["translateZ(var(--half))", 0],
  ["rotateY(180deg) translateZ(var(--half))", 0.2],
  ["rotateY(90deg) translateZ(var(--half))", 0.35],
  ["rotateY(-90deg) translateZ(var(--half))", 0.35],
  ["rotateX(90deg) translateZ(var(--half))", 0.15],
  ["rotateX(-90deg) translateZ(var(--half))", 0.5],
];

export function Cubes({
  grid = 8,
  maxAngle = 45,
  radius = 3,
  gap = 8,
  rippleColor = "#c6ff3d",
  rippleSpeed = 1,
  autoAnimate = true,
  className,
}: CubesProps) {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current!;
    const cubes = Array.from(root.querySelectorAll<HTMLElement>("[data-cube]"));
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const cur = cubes.map(() => ({ rx: 0, ry: 0, z: 0 }));
    const ripples: { x: number; y: number; t0: number }[] = [];
    const pointer = { x: 0, y: 0, in: false };
    let raf = 0;
    let visible = true;
    let lastAuto = 0;

    const ro = new ResizeObserver(() => {
      const cell = cubes[0]?.parentElement?.offsetWidth ?? 0;
      root.style.setProperty("--half", `${cell / 2}px`);
    });
    ro.observe(root);

    const loop = (now: number) => {
      const t = now / 1000;
      let px = pointer.x;
      let py = pointer.y;
      const auto = !pointer.in && autoAnimate && !reduced;
      if (auto) {
        px = grid / 2 + Math.sin(t * 0.6) * grid * 0.38;
        py = grid / 2 + Math.cos(t * 0.83) * grid * 0.38;
        if (now - lastAuto > 4200) {
          lastAuto = now;
          ripples.push({ x: px, y: py, t0: now });
        }
      }
      const active = pointer.in || auto;
      for (let i = ripples.length - 1; i >= 0; i--) if (now - ripples[i].t0 > 2600) ripples.splice(i, 1);

      cubes.forEach((el, i) => {
        const cx = (i % grid) + 0.5;
        const cy = Math.floor(i / grid) + 0.5;
        const dx = px - cx;
        const dy = py - cy;
        const infl = active ? Math.max(0, 1 - Math.hypot(dx, dy) / radius) : 0;
        const e = infl * infl * (3 - 2 * infl);
        const c = cur[i];
        const k = reduced ? 1 : 0.14;
        // Face the pointer: full tilt a cell away, easing to flat right under it.
        const dist = Math.max(Math.hypot(dx, dy), 0.9);
        c.rx += ((-dy / dist) * maxAngle * e - c.rx) * k;
        c.ry += ((dx / dist) * maxAngle * e - c.ry) * k;
        c.z += (e - c.z) * k;
        let rx = c.rx;
        let ry = c.ry;
        let z = c.z;
        let glow = c.z * 0.35;
        for (const r of ripples) {
          const age = (now - r.t0) / 1000;
          const rdx = cx - r.x;
          const rdy = cy - r.y;
          const d = Math.hypot(rdx, rdy) || 1;
          const front = age * 9 * rippleSpeed;
          const w = Math.exp(-((d - front) ** 2) / 1.4) * Math.max(0, 1 - age / 2.4);
          // Flip each cube around the axis perpendicular to the wave's travel.
          rx += (-rdy / d) * w * 120;
          ry += (rdx / d) * w * 120;
          z += w * 0.9;
          glow += w * 0.85;
        }
        el.style.transform = `translateZ(calc(var(--half) * ${z.toFixed(3)})) rotateX(${rx.toFixed(2)}deg) rotateY(${ry.toFixed(2)}deg)`;
        el.style.setProperty("--glow", `${Math.min(100, glow * 100).toFixed(1)}%`);
      });
      raf = visible ? requestAnimationFrame(loop) : 0;
    };

    const cellFromEvent = (e: PointerEvent | MouseEvent) => {
      const r = root.getBoundingClientRect();
      return { x: ((e.clientX - r.left) / r.width) * grid, y: ((e.clientY - r.top) / r.height) * grid };
    };
    const onMove = (e: PointerEvent) => {
      Object.assign(pointer, cellFromEvent(e), { in: true });
    };
    const onLeave = () => {
      pointer.in = false;
    };
    const onClick = (e: MouseEvent) => {
      if (!reduced) ripples.push({ ...cellFromEvent(e), t0: performance.now() });
    };

    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible && !raf) raf = requestAnimationFrame(loop);
    });
    io.observe(root);
    root.addEventListener("pointermove", onMove, { passive: true });
    root.addEventListener("pointerleave", onLeave);
    root.addEventListener("click", onClick);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      root.removeEventListener("pointermove", onMove);
      root.removeEventListener("pointerleave", onLeave);
      root.removeEventListener("click", onClick);
    };
  }, [grid, maxAngle, radius, rippleSpeed, autoAnimate]);

  return (
    <div
      ref={rootRef}
      aria-hidden
      className={className}
      style={{
        display: "grid",
        gridTemplateColumns: `repeat(${grid}, 1fr)`,
        gap,
        aspectRatio: "1",
        perspective: "1000px",
        transformStyle: "preserve-3d",
      }}
    >
      {Array.from({ length: grid * grid }, (_, i) => (
        <div key={i} style={{ position: "relative", aspectRatio: "1", transformStyle: "preserve-3d" }}>
          <div data-cube style={{ position: "absolute", inset: 0, transformStyle: "preserve-3d", willChange: "transform" }}>
            {FACES.map(([transform, shade]) => (
              <div
                key={transform}
                style={{
                  position: "absolute",
                  inset: 0,
                  transform,
                  border: `1px solid color-mix(in oklab, var(--border, rgba(255,255,255,.1)), ${rippleColor} var(--glow, 0%))`,
                  background: `linear-gradient(145deg, rgba(255,255,255,.06), rgba(0,0,0,${shade + 0.1})), color-mix(in oklab, var(--card, #18181b), ${rippleColor} var(--glow, 0%))`,
                  backfaceVisibility: "hidden",
                }}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
