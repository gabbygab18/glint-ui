"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface TargetCursorProps {
  children: ReactNode;
  /** Elements matching this selector get wrapped by the brackets. */
  targetSelector?: string;
  color?: string;
  /** Degrees per second the idle reticle spins. */
  spinSpeed?: number;
  /** Idle reticle size in px. */
  size?: number;
  /** Px between a target and the brackets. */
  padding?: number;
  /** Hide the system cursor inside the container (mouse only). */
  hideCursor?: boolean;
  className?: string;
}

const CSS = `@media (pointer: fine){.tc-hide,.tc-hide *{cursor:none!important}}`;
// Idle offsets for the four brackets: top-left, top-right, bottom-right, bottom-left.
const DIRS = [
  [-1, -1],
  [1, -1],
  [1, 1],
  [-1, 1],
];

export function TargetCursor({
  children,
  targetSelector = "[data-cursor-target]",
  color = "#ffffff",
  spinSpeed = 120,
  size = 34,
  padding = 8,
  hideCursor = true,
  className,
}: TargetCursorProps) {
  const root = useRef<HTMLDivElement>(null);
  const layer = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = root.current!;
    const [dot, ...brackets] = Array.from(layer.current!.children) as HTMLElement[];
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const mouse = { x: 0, y: 0, inside: false, down: false };
    const corners = DIRS.map(() => ({ x: 0, y: 0 }));
    let target: Element | null = null;
    let angle = 0;
    let raf = 0;
    let last = performance.now();
    let fresh = true;

    const frame = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      const box = el.getBoundingClientRect();
      let goals: { x: number; y: number }[];
      if (target) {
        // Settle on the nearest quarter turn, then hand each bracket the rect corner its rotation now faces.
        const snap = Math.round(angle / 90) * 90;
        angle += (snap - angle) * (reduced ? 1 : 0.2);
        const q = (((snap / 90) % 4) + 4) % 4;
        const r = target.getBoundingClientRect();
        const pad = padding - (mouse.down ? 3 : 0);
        const rect = [
          { x: r.left - pad, y: r.top - pad },
          { x: r.right + pad, y: r.top - pad },
          { x: r.right + pad, y: r.bottom + pad },
          { x: r.left - pad, y: r.bottom + pad },
        ];
        goals = DIRS.map((_, i) => ({ x: rect[(i + q) % 4].x - box.left, y: rect[(i + q) % 4].y - box.top }));
      } else {
        if (!reduced) angle += spinSpeed * dt;
        const half = (size / 2) * (mouse.down ? 0.75 : 1);
        const a = (angle * Math.PI) / 180;
        const cos = Math.cos(a);
        const sin = Math.sin(a);
        goals = DIRS.map(([dx, dy]) => ({
          x: mouse.x + (dx * cos - dy * sin) * half,
          y: mouse.y + (dx * sin + dy * cos) * half,
        }));
      }
      const ease = fresh || reduced ? 1 : target ? 0.22 : 0.35;
      fresh = false;
      corners.forEach((c, i) => {
        c.x += (goals[i].x - c.x) * ease;
        c.y += (goals[i].y - c.y) * ease;
        brackets[i].style.transform = `translate(${c.x}px,${c.y}px) rotate(${angle + i * 90}deg)`;
      });
      dot.style.transform = `translate(${mouse.x}px,${mouse.y}px) translate(-50%,-50%) scale(${mouse.down ? 0.6 : 1})`;
      raf = mouse.inside || target ? requestAnimationFrame(frame) : 0;
    };
    const start = () => {
      if (!raf) {
        last = performance.now();
        raf = requestAnimationFrame(frame);
      }
    };
    const show = (on: boolean) => {
      layer.current!.style.opacity = on ? "1" : "0";
    };
    const find = (node: EventTarget | null) => {
      const t = node instanceof Element ? node.closest(targetSelector) : null;
      return t && el.contains(t) ? t : null;
    };

    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      const box = el.getBoundingClientRect();
      mouse.x = e.clientX - box.left;
      mouse.y = e.clientY - box.top;
      if (!mouse.inside) fresh = true;
      mouse.inside = true;
      target = find(e.target);
      show(true);
      start();
    };
    const onLeave = () => {
      mouse.inside = false;
      target = null;
      show(false);
    };
    const onDown = () => (mouse.down = true);
    const onUp = () => (mouse.down = false);
    // Keyboard users get the brackets on whatever target holds focus.
    const onFocus = (e: FocusEvent) => {
      const t = find(e.target);
      if (!t || mouse.inside) return;
      target = t;
      fresh = !layer.current!.style.opacity || layer.current!.style.opacity === "0";
      dot.style.opacity = "0";
      show(true);
      start();
    };
    const onBlur = () => {
      if (mouse.inside) return;
      target = null;
      show(false);
    };

    el.addEventListener("pointermove", onMove, { passive: true });
    el.addEventListener("pointerleave", onLeave);
    el.addEventListener("pointerdown", onDown);
    el.addEventListener("pointerup", onUp);
    el.addEventListener("focusin", onFocus);
    el.addEventListener("focusout", onBlur);
    const restoreDot = () => (dot.style.opacity = "");
    el.addEventListener("pointerenter", restoreDot);
    return () => {
      cancelAnimationFrame(raf);
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerleave", onLeave);
      el.removeEventListener("pointerdown", onDown);
      el.removeEventListener("pointerup", onUp);
      el.removeEventListener("focusin", onFocus);
      el.removeEventListener("focusout", onBlur);
      el.removeEventListener("pointerenter", restoreDot);
    };
  }, [targetSelector, spinSpeed, size, padding]);

  const arm = Math.max(8, size * 0.32);
  return (
    <div ref={root} className={cn("relative", hideCursor && "tc-hide", className)}>
      {hideCursor && (
        <style href="target-cursor" precedence="default">
          {CSS}
        </style>
      )}
      {children}
      <div
        ref={layer}
        aria-hidden
        className="pointer-events-none absolute inset-0 z-50 overflow-visible"
        style={{ opacity: 0, transition: "opacity .2s" }}
      >
        <span
          className="absolute left-0 top-0 size-1.5 rounded-full"
          style={{ background: color, boxShadow: `0 0 10px ${color}` }}
        />
        {DIRS.map((_, i) => (
          <span
            key={i}
            className="absolute left-0 top-0"
            style={{
              width: arm,
              height: arm,
              borderTop: `2px solid ${color}`,
              borderLeft: `2px solid ${color}`,
              transformOrigin: "0 0",
              filter: `drop-shadow(0 0 4px ${color}66)`,
            }}
          />
        ))}
      </div>
    </div>
  );
}
