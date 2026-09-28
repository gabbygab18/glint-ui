"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface CursorHighlightProps {
  children: ReactNode;
  /** Elements the highlight snaps to. */
  selector?: string;
  color?: string;
  /** Peak opacity of the highlight, 0–1. */
  opacity?: number;
  /** Diameter of the free-floating blob in px. */
  blobSize?: number;
  /** Px the highlight extends past a hovered element. */
  padding?: number;
  /** Corner radius when wrapped around an element, in px. */
  radius?: number;
  /** Spring stiffness, 0–1. Higher = snappier. */
  stiffness?: number;
  className?: string;
}

const KEYS = ["x", "y", "w", "h", "r", "blur", "a"] as const;
type State = Record<(typeof KEYS)[number], number>;

export function CursorHighlight({
  children,
  selector = "[data-highlight], a, button",
  color = "#c6ff3d",
  opacity = 0.16,
  blobSize = 90,
  padding = 4,
  radius = 12,
  stiffness = 0.2,
  className,
}: CursorHighlightProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const blobRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current!;
    const blob = blobRef.current!;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const cur: State = { x: 0, y: 0, w: blobSize, h: blobSize, r: blobSize / 2, blur: 0, a: 0 };
    const vel: State = { x: 0, y: 0, w: 0, h: 0, r: 0, blur: 0, a: 0 };
    const tgt: State = { ...cur };
    const pointer = { x: 0, y: 0, in: false };
    let attached: Element | null = null;
    let raf = 0;

    const aim = () => {
      if (attached) {
        const rr = root.getBoundingClientRect();
        const b = attached.getBoundingClientRect();
        Object.assign(tgt, {
          x: b.left - rr.left - padding,
          y: b.top - rr.top - padding,
          w: b.width + padding * 2,
          h: b.height + padding * 2,
          r: radius,
          blur: 0,
          a: 1,
        });
      } else {
        Object.assign(tgt, {
          x: pointer.x - blobSize / 2,
          y: pointer.y - blobSize / 2,
          w: blobSize,
          h: blobSize,
          r: blobSize / 2,
          blur: blobSize * 0.3,
          a: pointer.in ? 0.7 : 0,
        });
      }
    };

    const loop = () => {
      aim();
      let moving = false;
      for (const k of KEYS) {
        if (reduced) cur[k] = tgt[k];
        else {
          // Slightly underdamped spring: a touch of overshoot sells the morph.
          vel[k] = vel[k] * 0.7 + (tgt[k] - cur[k]) * stiffness;
          cur[k] += vel[k];
        }
        if (Math.abs(tgt[k] - cur[k]) > 0.05 || Math.abs(vel[k]) > 0.05) moving = true;
      }
      blob.style.transform = `translate3d(${cur.x}px, ${cur.y}px, 0)`;
      blob.style.width = `${Math.max(0, cur.w)}px`;
      blob.style.height = `${Math.max(0, cur.h)}px`;
      blob.style.borderRadius = `${Math.max(0, cur.r)}px`;
      blob.style.filter = `blur(${Math.max(0, cur.blur)}px)`;
      blob.style.opacity = String(Math.max(0, Math.min(1, cur.a)));
      raf = moving ? requestAnimationFrame(loop) : 0;
    };
    const wake = () => {
      if (!raf) raf = requestAnimationFrame(loop);
    };
    const snap = (next: Element | null) => {
      // Jump straight to the first target instead of flying in from a stale spot.
      if (next && cur.a < 0.05) {
        attached = next;
        aim();
        Object.assign(cur, tgt, { a: 0 });
      }
      attached = next;
      wake();
    };

    const onMove = (e: PointerEvent) => {
      const r = root.getBoundingClientRect();
      pointer.x = e.clientX - r.left;
      pointer.y = e.clientY - r.top;
      if (!pointer.in) {
        pointer.in = true;
        if (cur.a < 0.05) Object.assign(cur, { x: pointer.x - blobSize / 2, y: pointer.y - blobSize / 2 });
      }
      const hit = (e.target as Element).closest?.(selector);
      snap(hit && root.contains(hit) ? hit : null);
    };
    const onLeave = () => {
      pointer.in = false;
      attached = null;
      wake();
    };
    const onFocus = (e: FocusEvent) => {
      const hit = (e.target as Element).closest?.(selector);
      if (hit && root.contains(hit)) snap(hit);
    };
    const onBlur = () => {
      if (!pointer.in) {
        attached = null;
        wake();
      }
    };

    root.addEventListener("pointermove", onMove, { passive: true });
    root.addEventListener("pointerleave", onLeave);
    root.addEventListener("focusin", onFocus);
    root.addEventListener("focusout", onBlur);
    return () => {
      cancelAnimationFrame(raf);
      root.removeEventListener("pointermove", onMove);
      root.removeEventListener("pointerleave", onLeave);
      root.removeEventListener("focusin", onFocus);
      root.removeEventListener("focusout", onBlur);
    };
  }, [selector, blobSize, padding, radius, stiffness]);

  return (
    <div ref={rootRef} className={cn("relative isolate", className)}>
      <div
        ref={blobRef}
        aria-hidden
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          zIndex: -1,
          opacity: 0,
          pointerEvents: "none",
          willChange: "transform, width, height",
          background: `color-mix(in srgb, ${color} ${opacity * 100}%, transparent)`,
          boxShadow: `0 0 0 1px color-mix(in srgb, ${color} ${Math.min(100, opacity * 150)}%, transparent), 0 8px 32px -8px color-mix(in srgb, ${color} ${Math.min(100, opacity * 200)}%, transparent)`,
        }}
      />
      {children}
    </div>
  );
}
