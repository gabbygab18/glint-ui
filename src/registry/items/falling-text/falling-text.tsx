"use client";

import Matter from "matter-js";
import { useEffect, useRef, useState } from "react";

export interface FallingTextProps {
  text?: string;
  /** Words (case-insensitive, punctuation ignored) drawn in the accent color. */
  highlightWords?: string[];
  /** What drops the words. `auto` drops them on mount. */
  trigger?: "hover" | "click" | "view" | "auto";
  /** Gravity strength. */
  gravity?: number;
  /** Bounciness, 0-1. */
  restitution?: number;
  highlightColor?: string;
  className?: string;
}

const clean = (w: string) => w.toLowerCase().replace(/[^\p{L}\p{N}]/gu, "");

/** Remounts the physics scene whenever an option changes. */
export function FallingText(props: FallingTextProps) {
  const { text, trigger, gravity, restitution, highlightWords } = props;
  return <Scene key={`${text}|${trigger}|${gravity}|${restitution}|${highlightWords?.join()}`} {...props} />;
}

function Scene({
  text = "React components that move you. Drop them in, drag them around, and ship interfaces people remember.",
  highlightWords = ["move", "drag", "ship", "remember"],
  trigger = "hover",
  gravity = 1,
  restitution = 0.4,
  highlightColor = "#a3e635",
  className,
}: FallingTextProps) {
  const root = useRef<HTMLDivElement>(null);
  const words = useRef<(HTMLSpanElement | null)[]>([]);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (trigger === "auto") {
      const t = setTimeout(() => setStarted(true), 400);
      return () => clearTimeout(t);
    }
    if (trigger !== "view" || !root.current) return;
    const io = new IntersectionObserver(([entry]) => entry.isIntersecting && setStarted(true), { threshold: 0.4 });
    io.observe(root.current);
    return () => io.disconnect();
  }, [trigger]);

  useEffect(() => {
    if (!started) return;
    const el = root.current!;
    const { Engine, Bodies, Body, Composite, Constraint, Query } = Matter;
    const box = el.getBoundingClientRect();
    const W = box.width;
    const H = box.height;
    const engine = Engine.create({ gravity: { x: 0, y: gravity } });
    const wall = { isStatic: true };
    Composite.add(engine.world, [
      Bodies.rectangle(W / 2, H + 50, W * 3, 100, wall),
      Bodies.rectangle(-50, 0, 100, H * 4, wall),
      Bodies.rectangle(W + 50, 0, 100, H * 4, wall),
    ]);

    // Measure every word first, then go absolute, so the paragraph does not reflow mid-measure.
    const spans = words.current.filter((s): s is HTMLSpanElement => !!s);
    const rects = spans.map((s) => s.getBoundingClientRect());
    const bodies = rects.map((r) => {
      const b = Bodies.rectangle(r.left - box.left + r.width / 2, r.top - box.top + r.height / 2, r.width + 8, r.height, {
        restitution,
        friction: 0.3,
        frictionAir: 0.012,
        chamfer: { radius: Math.min(r.height / 2, 10) },
      });
      Body.setVelocity(b, { x: (Math.random() - 0.5) * 4, y: -Math.random() * 2 });
      Body.setAngularVelocity(b, (Math.random() - 0.5) * 0.06);
      return b;
    });
    spans.forEach((s, i) => {
      Object.assign(s.style, { position: "absolute", left: "0", top: "0", width: `${rects[i].width}px`, margin: "0" });
    });
    Composite.add(engine.world, bodies);

    let grab: Matter.Constraint | null = null;
    const local = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      return { x: e.clientX - r.left, y: e.clientY - r.top };
    };
    const down = (e: PointerEvent) => {
      const p = local(e);
      const body = Query.point(bodies, p)[0];
      if (!body) return;
      grab = Constraint.create({
        pointA: p,
        bodyB: body,
        pointB: { x: p.x - body.position.x, y: p.y - body.position.y },
        length: 0,
        stiffness: 0.2,
        damping: 0.1,
      });
      Composite.add(engine.world, grab);
      el.setPointerCapture(e.pointerId);
      el.style.cursor = "grabbing";
    };
    const move = (e: PointerEvent) => {
      if (grab) grab.pointA = local(e);
    };
    const up = () => {
      if (grab) Composite.remove(engine.world, grab);
      grab = null;
      el.style.cursor = "grab";
    };

    let raf = 0;
    let visible = true;
    const loop = () => {
      Engine.update(engine, 1000 / 60);
      bodies.forEach((b, i) => {
        const r = rects[i];
        spans[i].style.transform = `translate(${b.position.x - r.width / 2}px, ${b.position.y - r.height / 2}px) rotate(${b.angle}rad)`;
      });
      raf = visible ? requestAnimationFrame(loop) : 0;
    };
    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible && !raf) raf = requestAnimationFrame(loop);
    });
    io.observe(el);
    el.style.cursor = "grab";
    el.addEventListener("pointerdown", down);
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerup", up);
    el.addEventListener("pointercancel", up);
    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      el.removeEventListener("pointerdown", down);
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerup", up);
      el.removeEventListener("pointercancel", up);
      Engine.clear(engine);
    };
  }, [started, gravity, restitution]);

  const hl = new Set(highlightWords.map(clean));
  const start = () => {
    if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) setStarted(true);
  };
  return (
    <div
      ref={root}
      className={className}
      onPointerEnter={trigger === "hover" ? start : undefined}
      onClick={trigger === "click" ? start : undefined}
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        overflow: "hidden",
        display: "grid",
        placeItems: "center",
        cursor: !started && trigger === "click" ? "pointer" : undefined,
        userSelect: started ? "none" : undefined,
      }}
    >
      <span className="sr-only">{text}</span>
      <p aria-hidden style={{ margin: 0, textAlign: "center", maxWidth: "min(90%, 44rem)" }}>
        {text.split(/\s+/).map((w, i) => (
          <span
            key={i}
            ref={(node) => {
              words.current[i] = node;
            }}
            style={{
              display: "inline-block",
              margin: "0 0.14em",
              whiteSpace: "nowrap",
              touchAction: started ? "none" : undefined,
              willChange: started ? "transform" : undefined,
              color: hl.has(clean(w)) ? highlightColor : undefined,
            }}
          >
            {w}
          </span>
        ))}
      </p>
    </div>
  );
}
