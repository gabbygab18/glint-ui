"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface FollowCursorProps {
  /** The area the label follows the cursor over. */
  children: ReactNode;
  /** Text on the pill. */
  label?: string;
  /** Spring pull toward the cursor (0-1). */
  stiffness?: number;
  /** Velocity kept per frame (0-1). Higher is bouncier. */
  damping?: number;
  /** Lean the pill into horizontal motion. */
  tilt?: boolean;
  /** Hide the system cursor over the area (mouse only). */
  hideCursor?: boolean;
  className?: string;
}

export function FollowCursor({
  children,
  label = "View project",
  stiffness = 0.12,
  damping = 0.7,
  tilt = true,
  hideCursor = true,
  className,
}: FollowCursorProps) {
  const root = useRef<HTMLDivElement>(null);
  const pill = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = root.current!;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const s = { x: 0, y: 0, vx: 0, vy: 0, scale: 0 };
    const goal = { x: 0, y: 0, scale: 0 };
    let down = false;
    let raf = 0;

    const frame = () => {
      if (!pill.current) return void (raf = 0); // unmounted
      if (reduced) {
        s.x = goal.x;
        s.y = goal.y;
        s.vx = s.vy = 0;
      } else {
        s.vx = (s.vx + (goal.x - s.x) * stiffness) * damping;
        s.vy = (s.vy + (goal.y - s.y) * stiffness) * damping;
        s.x += s.vx;
        s.y += s.vy;
      }
      const targetScale = goal.scale * (down ? 0.82 : 1);
      s.scale += (targetScale - s.scale) * (reduced ? 1 : 0.2);
      const lean = tilt && !reduced ? Math.max(-18, Math.min(18, s.vx * 1.2)) : 0;
      pill.current!.style.transform = `translate(${s.x}px,${s.y}px) translate(-50%,-50%) rotate(${lean}deg) scale(${s.scale})`;
      const moving = Math.abs(s.vx) + Math.abs(s.vy) > 0.05 || Math.abs(targetScale - s.scale) > 0.002;
      raf = moving ? requestAnimationFrame(frame) : 0;
    };
    const kick = () => {
      if (!raf) raf = requestAnimationFrame(frame);
    };
    const local = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      return [e.clientX - r.left, e.clientY - r.top];
    };

    const onEnter = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      [goal.x, goal.y] = local(e);
      // Pop in from where the cursor entered instead of flying across the card.
      if (s.scale < 0.05) [s.x, s.y] = [goal.x, goal.y];
      goal.scale = 1;
      kick();
    };
    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      [goal.x, goal.y] = local(e);
      goal.scale = 1;
      kick();
    };
    const onLeave = () => {
      goal.scale = 0;
      down = false;
      kick();
    };
    const onDown = () => {
      down = true;
      kick();
    };
    const onUp = () => {
      down = false;
      kick();
    };

    el.addEventListener("pointerenter", onEnter);
    el.addEventListener("pointermove", onMove, { passive: true });
    el.addEventListener("pointerleave", onLeave);
    el.addEventListener("pointerdown", onDown);
    el.addEventListener("pointerup", onUp);
    return () => {
      cancelAnimationFrame(raf);
      el.removeEventListener("pointerenter", onEnter);
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerleave", onLeave);
      el.removeEventListener("pointerdown", onDown);
      el.removeEventListener("pointerup", onUp);
    };
  }, [stiffness, damping, tilt]);

  return (
    <div ref={root} className={cn("relative", hideCursor && "[@media(pointer:fine)]:cursor-none", className)}>
      {children}
      <div
        ref={pill}
        aria-hidden
        className="pointer-events-none absolute left-0 top-0 z-10 flex items-center gap-1.5 whitespace-nowrap rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-lg shadow-black/30"
        style={{ transform: "scale(0)", willChange: "transform" }}
      >
        {label}
        <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
          <path d="M7 17 17 7M8 7h9v9" />
        </svg>
      </div>
    </div>
  );
}
