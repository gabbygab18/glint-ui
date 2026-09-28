"use client";

import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { animate, motion, useMotionValue, useReducedMotion, type PanInfo } from "motion/react";

type Corner = "top-left" | "top-right" | "bottom-left" | "bottom-right";

export interface DraggableAvatarProps {
  src: string;
  /** Accessible name, e.g. the person's name. */
  alt?: string;
  /** Avatar size in px. */
  size?: number;
  /** Corner it starts in (remount with a new `key` to reset). */
  corner?: Corner;
  /** Px gap between the avatar and the container edge. */
  padding?: number;
  /** Circle or rounded square. */
  shape?: "circle" | "rounded";
  /** Spring stiffness of the snap. */
  stiffness?: number;
  /** Spring damping of the snap. Lower is bouncier. */
  damping?: number;
  /** Green presence dot. */
  status?: boolean;
  onCornerChange?: (corner: Corner) => void;
  className?: string;
}

const LABEL: Record<Corner, string> = {
  "top-left": "top left",
  "top-right": "top right",
  "bottom-left": "bottom left",
  "bottom-right": "bottom right",
};

/**
 * Drop inside any `position: relative` container. The avatar can be dragged and
 * flung anywhere in it and springs to the nearest corner, carrying its velocity.
 */
export function DraggableAvatar({
  src,
  alt = "Avatar",
  size = 88,
  corner: initial = "bottom-right",
  padding = 16,
  shape = "circle",
  stiffness = 380,
  damping = 26,
  status = true,
  onCornerChange,
  className,
}: DraggableAvatarProps) {
  const area = useRef<HTMLDivElement>(null);
  const [corner, setCorner] = useState<Corner>(initial);
  const cornerRef = useRef(corner);
  const [dragging, setDragging] = useState(false);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  // Hidden until measured, so SSR never flashes it in the wrong corner.
  const opacity = useMotionValue(0);
  const reduced = useReducedMotion();

  const target = (c: Corner) => {
    const el = area.current;
    const w = el?.clientWidth ?? 0;
    const h = el?.clientHeight ?? 0;
    return {
      x: c.endsWith("left") ? padding : Math.max(padding, w - size - padding),
      y: c.startsWith("top") ? padding : Math.max(padding, h - size - padding),
    };
  };

  const snap = (c: Corner, vx = 0, vy = 0) => {
    const t = target(c);
    const spring = reduced ? { duration: 0 } : { type: "spring" as const, stiffness, damping };
    animate(x, t.x, { ...spring, velocity: vx });
    animate(y, t.y, { ...spring, velocity: vy });
  };

  const move = (c: Corner) => {
    cornerRef.current = c;
    setCorner(c);
    snap(c);
    onCornerChange?.(c);
  };

  // Place instantly on mount, resize and size changes; real moves animate via snap().
  useEffect(() => {
    const el = area.current;
    if (!el) return;
    const place = () => {
      const t = target(cornerRef.current);
      x.jump(t.x);
      y.jump(t.y);
    };
    place();
    opacity.set(1);
    const ro = new ResizeObserver(place);
    ro.observe(el);
    return () => ro.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [size, padding]);

  const onDragEnd = (_: unknown, info: PanInfo) => {
    setDragging(false);
    const el = area.current;
    if (!el) return;
    // Project where the fling would coast to, then pick the closest corner.
    const px = x.get() + info.velocity.x * 0.2 + size / 2;
    const py = y.get() + info.velocity.y * 0.2 + size / 2;
    const c = `${py < el.clientHeight / 2 ? "top" : "bottom"}-${px < el.clientWidth / 2 ? "left" : "right"}` as Corner;
    cornerRef.current = c;
    setCorner(c);
    snap(c, info.velocity.x, info.velocity.y);
    if (c !== corner) onCornerChange?.(c);
  };

  const onKey = (e: KeyboardEvent) => {
    const [v, h] = corner.split("-");
    let next: Corner | null = null;
    if (e.key === "ArrowLeft") next = `${v}-left` as Corner;
    else if (e.key === "ArrowRight") next = `${v}-right` as Corner;
    else if (e.key === "ArrowUp") next = `top-${h}` as Corner;
    else if (e.key === "ArrowDown") next = `bottom-${h}` as Corner;
    if (!next) return;
    e.preventDefault();
    if (next !== corner) move(next);
  };

  const round = shape === "circle" ? "9999px" : `${Math.round(size * 0.28)}px`;

  return (
    <div ref={area} className={`pointer-events-none absolute inset-0 ${className ?? ""}`}>
      <motion.button
        type="button"
        aria-label={`${alt}. In the ${LABEL[corner]} corner. Use arrow keys to move.`}
        drag
        dragMomentum={false}
        dragConstraints={area}
        dragElastic={0.18}
        onDragStart={() => setDragging(true)}
        onDragEnd={onDragEnd}
        onKeyDown={onKey}
        whileHover={reduced ? undefined : { scale: 1.04 }}
        whileDrag={{ scale: 1.1, cursor: "grabbing" }}
        className="pointer-events-auto absolute left-0 top-0 cursor-grab touch-none outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-4 focus-visible:ring-offset-background"
        style={{ x, y, width: size, height: size, borderRadius: round, opacity }}
      >
        <span
          className="block size-full overflow-hidden border-2 border-white/80 bg-muted transition-shadow duration-300"
          style={{
            borderRadius: round,
            boxShadow: dragging
              ? "0 30px 60px -12px rgba(0,0,0,.6), 0 12px 24px -8px rgba(0,0,0,.4)"
              : "0 14px 30px -10px rgba(0,0,0,.55), 0 4px 10px -4px rgba(0,0,0,.3)",
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={src} alt="" draggable={false} className="size-full select-none object-cover" />
        </span>
        {status && (
          <span
            aria-hidden
            className="absolute rounded-full border-2 border-background bg-emerald-400"
            style={{
              width: Math.max(10, size * 0.2),
              height: Math.max(10, size * 0.2),
              right: shape === "circle" ? size * 0.04 : -2,
              bottom: shape === "circle" ? size * 0.04 : -2,
            }}
          />
        )}
      </motion.button>
    </div>
  );
}
