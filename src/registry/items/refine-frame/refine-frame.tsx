"use client";

import { useRef, useState, type KeyboardEvent, type PointerEvent } from "react";
import { AnimatePresence, MotionConfig, motion } from "motion/react";

export interface CropRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface RefineFrameProps {
  /** Image to crop. */
  src?: string;
  alt?: string;
  /** Real pixel size of the image; the readout and onChange use these units. */
  naturalWidth?: number;
  naturalHeight?: number;
  /** Snap edges to the image edges, thirds and center. */
  snap?: boolean;
  /** Snap distance in screen px. */
  snapDistance?: number;
  /** Smallest crop, as a fraction of the image side (0-1). */
  minSize?: number;
  /** Guide and handle accent color. */
  accent?: string;
  /** Called with the crop in image pixels. */
  onChange?: (crop: CropRect) => void;
  className?: string;
}

type Box = { l: number; t: number; r: number; b: number };
type Mode = "move" | "nw" | "ne" | "sw" | "se";

const TARGETS = [0, 1 / 3, 0.5, 2 / 3, 1];
const corners: { mode: Mode; name: string; pos: string; edge: string }[] = [
  { mode: "nw", name: "top-left", pos: "-left-3.5 -top-3.5", edge: "left-2.5 top-2.5 border-l-[3px] border-t-[3px] rounded-tl-sm" },
  { mode: "ne", name: "top-right", pos: "-right-3.5 -top-3.5", edge: "right-2.5 top-2.5 border-r-[3px] border-t-[3px] rounded-tr-sm" },
  { mode: "sw", name: "bottom-left", pos: "-bottom-3.5 -left-3.5", edge: "bottom-2.5 left-2.5 border-b-[3px] border-l-[3px] rounded-bl-sm" },
  { mode: "se", name: "bottom-right", pos: "-bottom-3.5 -right-3.5", edge: "bottom-2.5 right-2.5 border-b-[3px] border-r-[3px] rounded-br-sm" },
];
const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

export function RefineFrame({
  src,
  alt = "",
  naturalWidth = 1600,
  naturalHeight = 1000,
  snap = true,
  snapDistance = 10,
  minSize = 0.15,
  accent = "#a3e635",
  onChange,
  className,
}: RefineFrameProps) {
  const stage = useRef<HTMLDivElement>(null);
  const drag = useRef<{ mode: Mode; x: number; y: number; start: Box; w: number; h: number } | null>(null);
  const [box, setBox] = useState<Box>({ l: 0.12, t: 0.14, r: 0.88, b: 0.86 });
  const [active, setActive] = useState<Mode | null>(null);
  const [guides, setGuides] = useState<{ v: number[]; h: number[] }>({ v: [], h: [] });

  // Move edges by (dx, dy) in 0-1 units from `start`, clamped, then magnetically snapped.
  const apply = (mode: Mode, dx: number, dy: number, start: Box, w: number, h: number) => {
    const sx = snap ? snapDistance / w : 0;
    const sy = snap ? snapDistance / h : 0;
    const near = (v: number, s: number) => TARGETS.find((t) => Math.abs(t - v) < s);
    const v: number[] = [];
    const hz: number[] = [];
    const n = { ...start };

    if (mode === "move") {
      const bw = start.r - start.l;
      const bh = start.b - start.t;
      n.l = clamp(start.l + dx, 0, 1 - bw);
      n.t = clamp(start.t + dy, 0, 1 - bh);
      // Try snapping the left edge, the right edge, then the center, per axis.
      for (const [off, s, axis] of [
        [0, sx, "x"], [bw, sx, "x"], [bw / 2, sx, "x"],
        [0, sy, "y"], [bh, sy, "y"], [bh / 2, sy, "y"],
      ] as const) {
        const cur = axis === "x" ? n.l : n.t;
        if ((axis === "x" ? v : hz).length) continue;
        const hit = near(cur + off, s);
        if (hit === undefined) continue;
        if (axis === "x") { n.l = clamp(hit - off, 0, 1 - bw); v.push(hit); }
        else { n.t = clamp(hit - off, 0, 1 - bh); hz.push(hit); }
      }
      n.r = n.l + bw;
      n.b = n.t + bh;
    } else {
      const edge = (val: number, lo: number, hi: number, s: number, out: number[]) => {
        const c = clamp(val, lo, hi);
        const hit = near(c, s);
        if (hit !== undefined && hit >= lo && hit <= hi) { out.push(hit); return hit; }
        return c;
      };
      if (mode[1] === "w") n.l = edge(start.l + dx, 0, start.r - minSize, sx, v);
      else n.r = edge(start.r + dx, start.l + minSize, 1, sx, v);
      if (mode[0] === "n") n.t = edge(start.t + dy, 0, start.b - minSize, sy, hz);
      else n.b = edge(start.b + dy, start.t + minSize, 1, sy, hz);
    }

    setBox(n);
    setGuides({ v, h: hz });
    onChange?.({
      x: Math.round(n.l * naturalWidth),
      y: Math.round(n.t * naturalHeight),
      width: Math.round((n.r - n.l) * naturalWidth),
      height: Math.round((n.b - n.t) * naturalHeight),
    });
  };

  const down = (mode: Mode, e: PointerEvent<HTMLElement>) => {
    const rect = stage.current?.getBoundingClientRect();
    if (!rect || e.button !== 0) return;
    e.stopPropagation();
    e.currentTarget.setPointerCapture(e.pointerId);
    drag.current = { mode, x: e.clientX, y: e.clientY, start: box, w: rect.width, h: rect.height };
    setActive(mode);
  };
  const move = (e: PointerEvent<HTMLElement>) => {
    const d = drag.current;
    if (d) apply(d.mode, (e.clientX - d.x) / d.w, (e.clientY - d.y) / d.h, d.start, d.w, d.h);
  };
  const up = () => {
    drag.current = null;
    setActive(null);
    setGuides({ v: [], h: [] });
  };
  const key = (mode: Mode) => (e: KeyboardEvent<HTMLElement>) => {
    const dirs: Record<string, [number, number]> = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] };
    const d = dirs[e.key];
    if (!d) return;
    e.preventDefault();
    e.stopPropagation();
    const step = e.shiftKey ? 0.05 : 0.01;
    // Infinite size = zero snap distance: snapping would swallow single key steps near a target.
    apply(mode, d[0] * step, d[1] * step, box, Infinity, Infinity);
    setGuides({ v: [], h: [] });
  };

  const pct = (n: number) => `${n * 100}%`;
  const w = Math.round((box.r - box.l) * naturalWidth);
  const h = Math.round((box.b - box.t) * naturalHeight);
  const track = { type: "spring", stiffness: 900, damping: 55 } as const;

  return (
    <MotionConfig reducedMotion="user">
      <div
        ref={stage}
        className={`relative w-full max-w-xl touch-none select-none overflow-hidden rounded-2xl bg-muted shadow-2xl ${className ?? ""}`}
        style={{ aspectRatio: `${naturalWidth} / ${naturalHeight}` }}
      >
        {src ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={src} alt={alt} draggable={false} className="absolute inset-0 size-full object-cover" />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-sky-400 via-violet-500 to-orange-400" />
        )}

        <AnimatePresence>
          {guides.v.map((g) => (
            <motion.span key={`v${g}`} aria-hidden className="pointer-events-none absolute inset-y-0 z-20 w-px" style={{ left: pct(g), background: accent }}
              initial={{ opacity: 0, scaleY: 0 }} animate={{ opacity: 1, scaleY: 1 }} exit={{ opacity: 0 }} />
          ))}
          {guides.h.map((g) => (
            <motion.span key={`h${g}`} aria-hidden className="pointer-events-none absolute inset-x-0 z-20 h-px" style={{ top: pct(g), background: accent }}
              initial={{ opacity: 0, scaleX: 0 }} animate={{ opacity: 1, scaleX: 1 }} exit={{ opacity: 0 }} />
          ))}
        </AnimatePresence>

        <motion.div
          role="group"
          tabIndex={0}
          aria-label={`Crop area, ${w} by ${h} pixels. Arrow keys move it, Shift for bigger steps.`}
          onPointerDown={(e) => down("move", e)}
          onPointerMove={move}
          onPointerUp={up}
          onPointerCancel={up}
          onKeyDown={key("move")}
          initial={false}
          animate={{ left: pct(box.l), top: pct(box.t), width: pct(box.r - box.l), height: pct(box.b - box.t) }}
          transition={track}
          className={`absolute z-10 border border-white/80 shadow-[0_0_0_9999px_rgb(0_0_0/.55)] outline-none focus-visible:border-2 ${active === "move" ? "cursor-grabbing" : "cursor-grab"}`}
          style={{ borderColor: guides.v.length || guides.h.length ? accent : undefined }}
        >
          {/* Rule-of-thirds grid while dragging. */}
          <div aria-hidden className={`pointer-events-none absolute inset-0 transition-opacity duration-200 ${active ? "opacity-100" : "opacity-0"}`}>
            {[1, 2].map((i) => (
              <span key={`c${i}`} className="absolute inset-y-0 w-px bg-white/40" style={{ left: `${(i * 100) / 3}%` }} />
            ))}
            {[1, 2].map((i) => (
              <span key={`r${i}`} className="absolute inset-x-0 h-px bg-white/40" style={{ top: `${(i * 100) / 3}%` }} />
            ))}
          </div>

          {corners.map((c) => (
            <motion.button
              key={c.mode}
              type="button"
              aria-label={`Resize from ${c.name} corner`}
              onPointerDown={(e) => down(c.mode, e)}
              onKeyDown={key(c.mode)}
              animate={{ scale: active === c.mode ? 1.3 : 1 }}
              whileHover={{ scale: active === c.mode ? 1.3 : 1.15 }}
              transition={{ type: "spring", stiffness: 600, damping: 15 }}
              className={`group absolute ${c.pos} size-8 rounded-full outline-none ${c.mode === "nw" || c.mode === "se" ? "cursor-nwse-resize" : "cursor-nesw-resize"}`}
            >
              <span
                aria-hidden
                className={`absolute size-4 border-white drop-shadow group-focus-visible:border-[var(--rf-accent)] ${c.edge}`}
                style={{ ["--rf-accent" as string]: accent }}
              />
            </motion.button>
          ))}

          <motion.span
            aria-hidden
            className="pointer-events-none absolute bottom-2 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-black/70 px-2.5 py-1 font-mono text-[11px] font-medium tabular-nums text-white backdrop-blur"
            animate={{ scale: active ? 1.08 : 1, y: active ? -2 : 0 }}
            transition={{ type: "spring", stiffness: 500, damping: 18 }}
          >
            {w} × {h}
          </motion.span>
        </motion.div>
        <span className="sr-only" aria-live="polite">
          {active ? "" : `Crop ${w} by ${h} pixels`}
        </span>
      </div>
    </MotionConfig>
  );
}
