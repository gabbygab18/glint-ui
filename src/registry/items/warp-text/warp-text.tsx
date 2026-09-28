"use client";

import { useEffect, useId, useRef } from "react";

export interface WarpTextProps {
  text: string;
  /** Peak displacement in px. */
  strength?: number;
  /** Noise scale. Lower is broader, smoother waves. */
  frequency?: number;
  /** Speed of the flowing distortion. */
  speed?: number;
  /** Split red, green and blue for a chromatic fringe. */
  chromatic?: boolean;
  /** Warp while hovered, or keep a gentle warp running. */
  trigger?: "hover" | "always";
  as?: "p" | "h1" | "h2" | "h3" | "span" | "div";
  className?: string;
}

const channels = [
  { m: "1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0", k: 1.25 },
  { m: "0 0 0 0 0  0 1 0 0 0  0 0 0 0 0  0 0 0 1 0", k: 1 },
  { m: "0 0 0 0 0  0 0 0 0 0  0 0 1 0 0  0 0 0 1 0", k: 0.75 },
];

export function WarpText({
  text,
  strength = 24,
  frequency = 0.008,
  speed = 1,
  chromatic = true,
  trigger = "hover",
  as: Tag = "p",
  className,
}: WarpTextProps) {
  const id = `warp-${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;
  const host = useRef<HTMLElement>(null);
  const svg = useRef<SVGSVGElement>(null);
  const visual = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = host.current;
    const s = svg.current;
    const out = visual.current;
    if (!el || !s || !out || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const turb = s.querySelector("feTurbulence");
    const maps = Array.from(s.querySelectorAll("feDisplacementMap"));
    const always = trigger === "always";
    let hovered = false;
    let visible = true;
    let amount = 0;
    let raf = 0;
    let t = 0;
    let last = 0;

    const tick = (now: number) => {
      const dt = last ? Math.min((now - last) / 1000, 0.05) : 0;
      last = now;
      t += dt * speed;
      const goal = hovered ? 1 : always ? 0.35 : 0;
      amount += (goal - amount) * (1 - Math.exp(-dt * (hovered ? 6 : 3)));
      const fx = frequency * (1 + 0.35 * Math.sin(t * 1.3));
      const fy = frequency * 2 * (1 + 0.35 * Math.cos(t * 0.9));
      turb?.setAttribute("baseFrequency", `${fx.toFixed(5)} ${fy.toFixed(5)}`);
      maps.forEach((m, i) => m.setAttribute("scale", (strength * amount * (chromatic ? channels[i].k : 1)).toFixed(2)));
      const idle = !hovered && !always && amount < 0.01;
      out.style.filter = idle ? "none" : `url(#${id})`;
      if (idle) amount = 0;
      raf = !idle && visible ? requestAnimationFrame(tick) : 0;
    };
    const wake = () => {
      if (!raf && visible) {
        last = 0;
        raf = requestAnimationFrame(tick);
      }
    };
    const enter = () => {
      hovered = true;
      wake();
    };
    const leave = () => {
      hovered = false;
      wake();
    };
    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible && always) wake();
    });
    io.observe(el);
    el.addEventListener("pointerenter", enter);
    el.addEventListener("pointerleave", leave);
    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      el.removeEventListener("pointerenter", enter);
      el.removeEventListener("pointerleave", leave);
      out.style.filter = "none";
    };
  }, [id, strength, frequency, speed, chromatic, trigger]);

  return (
    <Tag ref={host as never} className={className}>
      <svg ref={svg} aria-hidden width="0" height="0" style={{ position: "absolute" }}>
        <filter id={id} x="-10%" y="-30%" width="120%" height="160%" colorInterpolationFilters="sRGB">
          <feTurbulence type="fractalNoise" baseFrequency={`${frequency} ${frequency * 2}`} numOctaves={1} seed={7} result="noise" />
          {chromatic ? (
            <>
              {channels.map((_, i) => (
                <feDisplacementMap key={`d${i}`} in="SourceGraphic" in2="noise" scale="0" xChannelSelector="R" yChannelSelector="G" result={`d${i}`} />
              ))}
              {channels.map((c, i) => (
                <feColorMatrix key={`c${i}`} in={`d${i}`} type="matrix" values={c.m} result={`c${i}`} />
              ))}
              <feBlend in="c0" in2="c1" mode="screen" result="rg" />
              <feBlend in="rg" in2="c2" mode="screen" />
            </>
          ) : (
            <feDisplacementMap in="SourceGraphic" in2="noise" scale="0" xChannelSelector="R" yChannelSelector="G" />
          )}
        </filter>
      </svg>
      <span className="sr-only">{text}</span>
      <span ref={visual} aria-hidden style={{ display: "inline-block", padding: "0.1em 0.15em", willChange: "filter" }}>
        {text}
      </span>
    </Tag>
  );
}
