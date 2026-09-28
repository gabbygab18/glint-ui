"use client";

import type { PointerEvent, ReactNode } from "react";
import { motion, useMotionTemplate, useMotionValue, useReducedMotion, useSpring, useTransform } from "motion/react";

export interface DriftCardProps {
  image: string;
  title: string;
  description?: string;
  /** Small label floating on the top layer. */
  eyebrow?: string;
  /** Extra foreground content (e.g. a button), drifts with the text. */
  children?: ReactNode;
  /** Max drift of the nearest layer in px. Farther layers drift less. */
  depth?: number;
  /** Max card tilt in degrees. */
  tilt?: number;
  width?: number;
  height?: number;
  className?: string;
}

type MV = ReturnType<typeof useSpring>;
const useDrift = (sx: MV, sy: MV, px: number) => ({
  x: useTransform(sx, (v) => v * px * 2),
  y: useTransform(sy, (v) => v * px * 2),
});

export function DriftCard({
  image,
  title,
  description,
  eyebrow,
  children,
  depth = 24,
  tilt = 8,
  width = 320,
  height = 420,
  className,
}: DriftCardProps) {
  const reduce = useReducedMotion();
  // Pointer position in the card, -0.5..0.5, eased with a spring so layers glide instead of snap.
  const px = useMotionValue(0);
  const py = useMotionValue(0);
  const sx = useSpring(px, { stiffness: 140, damping: 18, mass: 0.6 });
  const sy = useSpring(py, { stiffness: 140, damping: 18, mass: 0.6 });

  // Each layer drifts by a fraction of `depth`; negative moves against the pointer (far away).
  const back = useDrift(sx, sy, -0.6 * depth);
  const mid = useDrift(sx, sy, 0.5 * depth);
  const front = useDrift(sx, sy, depth);
  const extra = useDrift(sx, sy, 0.5 * depth); // children ride inside `mid`, this tops them up to `front`
  const rotateX = useTransform(sy, (v) => -v * tilt * 2);
  const rotateY = useTransform(sx, (v) => v * tilt * 2);
  const gx = useTransform(sx, (v) => `${(v + 0.5) * 100}%`);
  const gy = useTransform(sy, (v) => `${(v + 0.5) * 100}%`);
  const glare = useMotionTemplate`radial-gradient(circle at ${gx} ${gy}, rgba(255,255,255,.22), transparent 55%)`;

  const onMove = (e: PointerEvent<HTMLDivElement>) => {
    if (reduce) return;
    const r = e.currentTarget.getBoundingClientRect();
    px.set((e.clientX - r.left) / r.width - 0.5);
    py.set((e.clientY - r.top) / r.height - 0.5);
  };
  const onLeave = () => {
    px.set(0);
    py.set(0);
  };

  return (
    <div style={{ perspective: 1000, width, height }} onPointerMove={onMove} onPointerLeave={onLeave} className={className}>
      <motion.article
        className="group relative size-full overflow-hidden rounded-3xl border border-border bg-muted shadow-[0_40px_80px_-40px_rgba(0,0,0,.9)]"
        style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
      >
        <motion.img
          src={image}
          alt=""
          draggable={false}
          className="absolute -inset-[10%] size-[120%] max-w-none object-cover"
          style={back}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-black/10" />

        {eyebrow && (
          <motion.span
            style={front}
            className="absolute left-5 top-5 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-medium text-white backdrop-blur-md"
          >
            {eyebrow}
          </motion.span>
        )}

        <motion.div style={mid} className="absolute inset-x-0 bottom-0 p-6 text-white">
          <h3 className="text-2xl font-semibold tracking-tight">{title}</h3>
          {description && <p className="mt-2 text-sm leading-relaxed text-white/75">{description}</p>}
          {children && <motion.div style={extra} className="mt-5">{children}</motion.div>}
        </motion.div>

        <motion.div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          style={{ background: glare }}
        />
      </motion.article>
    </div>
  );
}
