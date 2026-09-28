"use client";

import { motion, useMotionValue, useReducedMotion, useSpring, useTransform, useVelocity } from "motion/react";
import { useEffect, useId, useRef, type PointerEvent, type ReactNode } from "react";
import useMeasure from "react-use-measure";
import { cn } from "@/lib/utils";

export interface FluidGlassProps {
  /** Content the lens floats over. Give it its own background. */
  children: ReactNode;
  /** Lens diameter in px. */
  size?: number;
  /** Magnification inside the lens. */
  zoom?: number;
  /** Px of edge refraction (how hard the rim bends the image). */
  refraction?: number;
  /** Px of chromatic split between color channels at the rim. */
  aberration?: number;
  /** Squash and stretch the lens with its speed. */
  wobble?: boolean;
  className?: string;
}

/** Radial displacement map: neutral in the middle, bending outward toward the rim. */
function lensMap(box: number, radius: number) {
  const c = document.createElement("canvas");
  c.width = c.height = box;
  const ctx = c.getContext("2d")!;
  const img = ctx.createImageData(box, box);
  const mid = box / 2;
  for (let y = 0; y < box; y++) {
    for (let x = 0; x < box; x++) {
      const nx = (x + 0.5 - mid) / radius;
      const ny = (y + 0.5 - mid) / radius;
      const d = Math.hypot(nx, ny);
      // Cubic falloff keeps the center clear and piles distortion onto the rim.
      const k = d > 1 ? 1 / d : d * d;
      const i = (y * box + x) * 4;
      img.data[i] = 128 + nx * k * 127;
      img.data[i + 1] = 128 + ny * k * 127;
      img.data[i + 2] = 128;
      img.data[i + 3] = 255;
    }
  }
  ctx.putImageData(img, 0, 0);
  return c.toDataURL();
}

const channel = (r: number, g: number, b: number) => `${r} 0 0 0 0  0 ${g} 0 0 0  0 0 ${b} 0 0  0 0 0 1 0`;

export function FluidGlass({
  children,
  size = 200,
  zoom = 1.35,
  refraction = 60,
  aberration = 6,
  wobble = true,
  className,
}: FluidGlassProps) {
  const [measureRef, bounds] = useMeasure();
  const mapRef = useRef<SVGFEImageElement>(null);
  const placed = useRef(false);
  const id = `fluid-glass-${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;
  const reduced = useReducedMotion();

  // Filtered box is padded so the rim can sample pixels from outside the lens.
  const pad = Math.ceil(refraction / 2 + aberration + 4);
  const box = size + pad * 2;

  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const spring = reduced ? { stiffness: 2000, damping: 100 } : { stiffness: 260, damping: 24, mass: 0.7 };
  const cx = useSpring(mx, spring);
  const cy = useSpring(my, spring);
  const vx = useVelocity(cx);
  const vy = useVelocity(cy);

  const lensX = useTransform(cx, (v) => v - size / 2);
  const lensY = useTransform(cy, (v) => v - size / 2);
  const cloneX = useTransform(cx, (v) => box / 2 - v * zoom);
  const cloneY = useTransform(cy, (v) => box / 2 - v * zoom);
  const stretch = (a: number, b: number) =>
    wobble && !reduced ? 1 + Math.min(Math.abs(a) / 5000, 0.18) - Math.min(Math.abs(b) / 9000, 0.09) : 1;
  const scaleX = useTransform([vx, vy], ([a, b]: number[]) => stretch(a, b));
  const scaleY = useTransform([vx, vy], ([a, b]: number[]) => stretch(b, a));

  useEffect(() => {
    mapRef.current?.setAttribute("href", lensMap(box, size / 2));
  }, [box, size]);

  // Park the lens in the middle until the pointer shows up.
  useEffect(() => {
    if (placed.current || !bounds.width) return;
    mx.jump(bounds.width / 2);
    my.jump(bounds.height / 2);
    cx.jump(bounds.width / 2);
    cy.jump(bounds.height / 2);
  }, [bounds.width, bounds.height, mx, my, cx, cy]);

  const onMove = (e: PointerEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    placed.current = true;
    mx.set(e.clientX - r.left);
    my.set(e.clientY - r.top);
  };

  return (
    <div ref={measureRef} onPointerMove={onMove} onPointerDown={onMove} className={cn("relative overflow-hidden", className)}>
      {children}

      <motion.div
        aria-hidden
        className="pointer-events-none absolute left-0 top-0 rounded-full"
        style={{
          width: size,
          height: size,
          x: lensX,
          y: lensY,
          scaleX,
          scaleY,
          boxShadow: "0 24px 60px -12px rgba(0,0,0,.55), 0 4px 14px rgba(0,0,0,.25)",
        }}
      >
        <div className="absolute inset-0 overflow-hidden rounded-full">
          <div
            className="absolute bg-background"
            style={{ left: -pad, top: -pad, width: box, height: box, overflow: "hidden", filter: `url(#${id})` }}
          >
            <motion.div
              inert
              className="absolute left-0 top-0"
              style={{ width: bounds.width, height: bounds.height, x: cloneX, y: cloneY, scale: zoom, originX: 0, originY: 0 }}
            >
              {children}
            </motion.div>
          </div>
          {/* Specular rim and a soft highlight: what makes it read as glass. */}
          <div
            className="absolute inset-0 rounded-full"
            style={{
              background:
                "radial-gradient(circle at 32% 24%, rgba(255,255,255,.42), rgba(255,255,255,0) 30%), radial-gradient(circle at 70% 82%, rgba(255,255,255,.14), rgba(255,255,255,0) 28%)",
              boxShadow:
                "inset 0 0 0 1px rgba(255,255,255,.35), inset 0 2px 1px rgba(255,255,255,.5), inset 0 -10px 24px rgba(0,0,0,.28), inset 0 12px 28px rgba(255,255,255,.12)",
            }}
          />
        </div>
      </motion.div>

      <svg aria-hidden width="0" height="0" className="absolute">
        <filter id={id} filterUnits="userSpaceOnUse" x="0" y="0" width={box} height={box} colorInterpolationFilters="sRGB">
          <feImage ref={mapRef} x="0" y="0" width={box} height={box} preserveAspectRatio="none" result="map" />
          <feDisplacementMap in="SourceGraphic" in2="map" scale={refraction} xChannelSelector="R" yChannelSelector="G" result="dr" />
          <feColorMatrix in="dr" values={channel(1, 0, 0)} result="r" />
          <feDisplacementMap in="SourceGraphic" in2="map" scale={refraction + aberration} xChannelSelector="R" yChannelSelector="G" result="dg" />
          <feColorMatrix in="dg" values={channel(0, 1, 0)} result="g" />
          <feDisplacementMap in="SourceGraphic" in2="map" scale={refraction + aberration * 2} xChannelSelector="R" yChannelSelector="G" result="db" />
          <feColorMatrix in="db" values={channel(0, 0, 1)} result="b" />
          <feBlend in="r" in2="g" mode="screen" result="rg" />
          <feBlend in="rg" in2="b" mode="screen" />
        </filter>
      </svg>
    </div>
  );
}
