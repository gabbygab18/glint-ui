"use client";

import Matter from "matter-js";
import { Children, useEffect, useRef, type ReactNode } from "react";
import { cn } from "@/lib/utils";

const { Engine, Bodies, Body, Composite, Constraint } = Matter;

export interface GravityProps {
  /** Each direct child becomes a physics body. */
  children: ReactNode;
  /** Downward gravity; negative floats things up. */
  gravity?: number;
  /** Restitution, 0 = dead stop, 1 = superball. */
  bounce?: number;
  /** Surface friction between bodies. */
  friction?: number;
  /** Wait until the container scrolls into view before dropping. */
  startOnView?: boolean;
  className?: string;
}

const STEP = 1000 / 60;

export function Gravity({
  children,
  gravity = 1,
  bounce = 0.35,
  friction = 0.2,
  startOnView = true,
  className,
}: GravityProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const count = Children.count(children);

  useEffect(() => {
    const root = rootRef.current!;
    const els = Array.from(root.querySelectorAll<HTMLElement>(":scope > [data-gravity-item]"));
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const engine = Engine.create({ gravity: { x: 0, y: gravity } });
    let w = root.offsetWidth;
    let h = root.offsetHeight;

    const wall = { isStatic: true, friction: 0.6 };
    const floor = Bodies.rectangle(w / 2, h + 50, 6000, 100, wall);
    const left = Bodies.rectangle(-50, 0, 100, 6000, wall);
    const right = Bodies.rectangle(w + 50, 0, 100, 6000, wall);

    const items = els.map((el, i) => {
      const bw = el.offsetWidth;
      const bh = el.offsetHeight;
      const x = bw / 2 + Math.random() * Math.max(1, w - bw);
      const body = Bodies.rectangle(x, -bh - i * 40, bw, bh, {
        chamfer: { radius: Math.min(bw, bh) / 2 - 0.5 },
        angle: (Math.random() - 0.5) * 0.8,
        restitution: bounce,
        friction,
        frictionAir: 0.012,
      });
      return { el, body, bw, bh };
    });
    Composite.add(engine.world, [floor, left, right, ...items.map((it) => it.body)]);

    const sync = () => {
      for (const { el, body, bw, bh } of items) {
        // Anything flung out of bounds gets dropped back in from the top.
        if (body.position.y > h + 400 || body.position.x < -400 || body.position.x > w + 400) {
          Body.setPosition(body, { x: w / 2, y: -bh });
          Body.setVelocity(body, { x: 0, y: 0 });
        }
        el.style.transform = `translate3d(${body.position.x - bw / 2}px, ${body.position.y - bh / 2}px, 0) rotate(${body.angle}rad)`;
        el.style.visibility = "visible";
      }
    };

    let raf = 0;
    let last = 0;
    let acc = 0;
    let visible = true;
    const loop = (now: number) => {
      acc += Math.min(now - (last || now), 50);
      last = now;
      // Fixed timestep keeps the simulation identical on 60 Hz and 120 Hz screens.
      while (acc >= STEP) {
        Engine.update(engine, STEP);
        acc -= STEP;
      }
      sync();
      raf = visible ? requestAnimationFrame(loop) : 0;
      if (!raf) last = 0;
    };
    const start = () => {
      if (!raf && visible) raf = requestAnimationFrame(loop);
    };
    if (reduced) {
      // Skip the fall: settle the pile off-screen, then show it at rest.
      for (let i = 0; i < 600; i++) Engine.update(engine, STEP);
      sync();
    }

    const io = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
        if (visible) start();
      },
      { threshold: 0.2 },
    );
    io.observe(root);
    if (!startOnView) start();

    const ro = new ResizeObserver(() => {
      w = root.offsetWidth;
      h = root.offsetHeight;
      Body.setPosition(floor, { x: w / 2, y: h + 50 });
      Body.setPosition(right, { x: w + 50, y: 0 });
    });
    ro.observe(root);

    // Drag and throw: pin the grabbed body to the pointer with a soft constraint.
    let drag: { c: Matter.Constraint; el: HTMLElement } | null = null;
    const local = (e: PointerEvent) => {
      const r = root.getBoundingClientRect();
      return { x: e.clientX - r.left, y: e.clientY - r.top };
    };
    const onDown = (e: PointerEvent) => {
      const it = items.find((i) => i.el.contains(e.target as Node));
      if (!it) return;
      const p = local(e);
      const c = Constraint.create({
        pointA: p,
        bodyB: it.body,
        pointB: { x: p.x - it.body.position.x, y: p.y - it.body.position.y },
        stiffness: 0.2,
        damping: 0.1,
        length: 0,
      });
      Composite.add(engine.world, c);
      it.el.setPointerCapture(e.pointerId);
      it.el.style.cursor = "grabbing";
      drag = { c, el: it.el };
      start();
    };
    const onMove = (e: PointerEvent) => {
      if (drag) drag.c.pointA = local(e);
    };
    const onUp = () => {
      if (!drag) return;
      Composite.remove(engine.world, drag.c);
      drag.el.style.cursor = "grab";
      drag = null;
    };
    root.addEventListener("pointerdown", onDown);
    root.addEventListener("pointermove", onMove);
    root.addEventListener("pointerup", onUp);
    root.addEventListener("pointercancel", onUp);

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      ro.disconnect();
      root.removeEventListener("pointerdown", onDown);
      root.removeEventListener("pointermove", onMove);
      root.removeEventListener("pointerup", onUp);
      root.removeEventListener("pointercancel", onUp);
      Composite.clear(engine.world, false);
      Engine.clear(engine);
    };
  }, [gravity, bounce, friction, startOnView, count]);

  return (
    <div ref={rootRef} className={cn("relative overflow-hidden", className)}>
      {Children.map(children, (child) => (
        <div
          data-gravity-item=""
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            visibility: "hidden",
            touchAction: "none",
            userSelect: "none",
            cursor: "grab",
            willChange: "transform",
          }}
        >
          {child}
        </div>
      ))}
    </div>
  );
}
