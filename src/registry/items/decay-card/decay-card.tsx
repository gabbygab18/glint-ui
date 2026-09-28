"use client";

import { useEffect, useId, useRef, type ReactNode } from "react";

export interface DecayCardProps {
  image: string;
  /** Card width in px. */
  width?: number;
  /** Card height in px. */
  height?: number;
  /** Strength of the displacement. 0 disables it. */
  intensity?: number;
  /** Noise frequency: lower = bigger, smoother blobs. */
  frequency?: number;
  /** How far the card drifts towards the cursor, in px. */
  drift?: number;
  /** Alt text for the image. */
  alt?: string;
  /** Overlay content, e.g. a caption. */
  children?: ReactNode;
  className?: string;
}

export function DecayCard({
  image,
  width = 300,
  height = 400,
  intensity = 1,
  frequency = 0.012,
  drift = 18,
  alt = "",
  children,
  className,
}: DecayCardProps) {
  const id = useId();
  const root = useRef<HTMLDivElement>(null);
  const card = useRef<HTMLDivElement>(null);
  const disp = useRef<SVGFEDisplacementMapElement>(null);
  const turb = useRef<SVGFETurbulenceElement>(null);

  useEffect(() => {
    const el = root.current!;
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const s = { tx: 0, ty: 0, x: 0, y: 0, energy: 0, amount: 0, lastX: 0, lastY: 0, has: false, t: 0 };
    let raf = 0;

    const tick = () => {
      if (!card.current || !disp.current || !turb.current) return void (raf = 0); // unmounted
      s.x += (s.tx - s.x) * 0.08;
      s.y += (s.ty - s.y) * 0.08;
      s.energy *= 0.9; // cursor speed decays when the pointer rests
      s.amount += (Math.min(1, s.energy) - s.amount) * 0.12;
      s.t += 0.01 + s.amount * 0.03;
      const nx = s.x / (width / 2);
      const ny = s.y / (height / 2);
      card.current!.style.transform = `translate3d(${nx * drift}px, ${ny * drift}px, 0) rotateX(${-ny * 6}deg) rotateY(${nx * 6}deg)`;
      disp.current!.setAttribute("scale", String(s.amount * 200 * intensity));
      turb.current!.setAttribute("baseFrequency", `${frequency} ${frequency * (1.2 + Math.sin(s.t) * 0.3)}`);
      const moving = Math.abs(s.tx - s.x) + Math.abs(s.ty - s.y) > 0.2 || s.amount > 0.002 || s.energy > 0.002;
      raf = moving ? requestAnimationFrame(tick) : 0;
    };
    const start = () => {
      if (!raf) raf = requestAnimationFrame(tick);
    };

    const onMove = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      const px = e.clientX - r.left - r.width / 2;
      const py = e.clientY - r.top - r.height / 2;
      if (s.has) s.energy += Math.hypot(px - s.lastX, py - s.lastY) / 90;
      s.energy = Math.min(s.energy, 1.6);
      s.lastX = px;
      s.lastY = py;
      s.has = true;
      s.tx = Math.max(-width / 2, Math.min(width / 2, px));
      s.ty = Math.max(-height / 2, Math.min(height / 2, py));
      start();
    };
    const onLeave = () => {
      s.tx = s.ty = 0;
      s.has = false;
      start();
    };
    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerleave", onLeave);
    return () => {
      cancelAnimationFrame(raf);
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerleave", onLeave);
    };
  }, [width, height, intensity, frequency, drift]);

  return (
    <div ref={root} className={`p-10 ${className ?? ""}`} style={{ perspective: 900 }}>
      <div
        ref={card}
        role="img"
        aria-label={alt || undefined}
        className="relative overflow-hidden rounded-2xl bg-card shadow-[0_40px_80px_-30px_rgba(0,0,0,.8)] will-change-transform"
        style={{ width, height }}
      >
        <svg aria-hidden width={width} height={height} className="absolute inset-0 block">
          <defs>
            <filter id={`${id}-f`} x="-10%" y="-10%" width="120%" height="120%" colorInterpolationFilters="sRGB">
              <feTurbulence ref={turb} type="fractalNoise" baseFrequency={frequency} numOctaves={4} seed={7} result="noise" />
              <feDisplacementMap ref={disp} in="SourceGraphic" in2="noise" scale={0} xChannelSelector="R" yChannelSelector="B" />
            </filter>
          </defs>
          <g filter={`url(#${id}-f)`}>
            <image href={image} crossOrigin="anonymous" x={0} y={0} width={width} height={height} preserveAspectRatio="xMidYMid slice" />
          </g>
        </svg>
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
        {children && <div className="absolute inset-x-0 bottom-0 p-6 text-white">{children}</div>}
      </div>
    </div>
  );
}
