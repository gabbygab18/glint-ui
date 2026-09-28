"use client";
/* eslint-disable @next/next/no-img-element */

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { X } from "lucide-react";

export interface DomeGalleryProps {
  images: string[];
  /** Sphere radius in px (also the camera distance). */
  radius?: number;
  /** Tiles around the full circle. */
  columns?: number;
  /** Rows of tiles, centered on the horizon. */
  rows?: number;
  /** Space between tiles as a fraction of their size. */
  gap?: number;
  /** Idle rotation in degrees per second. 0 disables. */
  autoRotate?: number;
  /** Degrees of rotation per px dragged. */
  dragSensitivity?: number;
  /** Max up/down tilt in degrees. */
  maxPitch?: number;
  /** Tile corner radius in px. */
  tileRadius?: number;
  className?: string;
}

const toRad = Math.PI / 180;

export function DomeGallery({
  images,
  radius = 560,
  columns = 22,
  rows = 5,
  gap = 0.1,
  autoRotate = 4,
  dragSensitivity = 0.18,
  maxPitch = 22,
  tileRadius = 14,
  className,
}: DomeGalleryProps) {
  const root = useRef<HTMLDivElement>(null);
  const sphere = useRef<HTMLDivElement>(null);
  const tileEls = useRef<(HTMLDivElement | null)[]>([]);
  const view = useRef({
    yaw: 0,
    pitch: 0,
    vYaw: 0,
    vPitch: 0,
    hover: false,
    drag: null as null | { x: number; y: number; lx: number; ly: number; moved: boolean; tile: number },
  });
  const [open, setOpen] = useState<number | null>(null);
  const openRef = useRef(open);
  const closeBtn = useRef<HTMLButtonElement>(null);

  const dLon = 360 / columns;
  const size = 2 * radius * Math.sin((dLon / 2) * toRad) * (1 - gap);
  const tiles: { lon: number; lat: number; src: string }[] = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < columns; c++) {
      // Stagger rows like bricks and spread images so neighbours differ.
      tiles.push({ lon: (c + (r % 2) * 0.5) * dLon, lat: (r - (rows - 1) / 2) * dLon, src: images[(c * 3 + r * 5) % images.length] ?? "" });
    }
  }

  useEffect(() => {
    openRef.current = open;
    if (open !== null) closeBtn.current?.focus();
  }, [open]);

  useEffect(() => {
    const el = root.current!;
    const v = view.current;
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    let raf = 0;
    let last = performance.now();
    let visible = true;
    let stopped = false;
    const shown: boolean[] = [];

    const frame = (now: number) => {
      // Observer callbacks can outlive cleanup; never touch the DOM after unmount.
      const sphereEl = sphere.current;
      if (stopped || !sphereEl) {
        raf = 0;
        return;
      }
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      if (!v.drag) {
        v.yaw += v.vYaw;
        v.pitch += v.vPitch;
        v.vYaw *= 0.93;
        v.vPitch *= 0.93;
        if (!reduce && !v.hover && openRef.current === null && Math.abs(v.vYaw) < 0.05) v.yaw -= autoRotate * dt;
        // Spring the pitch back inside its limits.
        const lim = Math.max(-maxPitch, Math.min(maxPitch, v.pitch));
        v.pitch += (lim - v.pitch) * 0.15;
      }
      sphereEl.style.transform = `translateZ(${radius}px) rotateX(${v.pitch}deg) rotateY(${v.yaw}deg)`;
      const sp = Math.sin(v.pitch * toRad);
      const cp = Math.cos(v.pitch * toRad);
      for (let i = 0; i < tiles.length; i++) {
        const t = tiles[i];
        const el = tileEls.current[i];
        if (!el) continue;
        // How directly the tile faces the camera (1 = dead ahead, <0 = behind).
        const facing = Math.cos(t.lat * toRad) * Math.cos((t.lon + v.yaw) * toRad) * cp - Math.sin(t.lat * toRad) * sp;
        const on = facing > 0.2;
        if (on !== shown[i]) {
          shown[i] = on;
          el.style.visibility = on ? "visible" : "hidden";
        }
        if (on) el.style.opacity = String(Math.min(1, (facing - 0.2) * 2.2));
      }
      raf = visible ? requestAnimationFrame(frame) : 0;
    };
    const start = () => {
      if (!raf && visible && !stopped) {
        last = performance.now();
        raf = requestAnimationFrame(frame);
      }
    };
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      start();
    });
    io.observe(el);
    start();
    return () => {
      stopped = true;
      cancelAnimationFrame(raf);
      io.disconnect();
    };
    // tiles is derived from the props below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [radius, columns, rows, autoRotate, maxPitch, images]);

  const frontTile = () => {
    const v = view.current;
    let best = 0;
    let bestScore = -Infinity;
    tiles.forEach((t, i) => {
      const s = Math.cos((t.lon + v.yaw) * toRad) * Math.cos((t.lat + v.pitch) * toRad);
      if (s > bestScore) {
        bestScore = s;
        best = i;
      }
    });
    return best;
  };

  const close = () => {
    setOpen(null);
    root.current?.focus();
  };

  return (
    <div
      ref={root}
      role="region"
      aria-roledescription="gallery"
      aria-label="Dome gallery. Drag or use arrow keys to look around, Enter to enlarge the photo in front."
      tabIndex={0}
      onKeyDown={(e) => {
        const v = view.current;
        if (open !== null) {
          if (e.key === "Escape") close();
          return;
        }
        if (e.key === "ArrowLeft") v.vYaw = dLon * 0.07;
        else if (e.key === "ArrowRight") v.vYaw = -dLon * 0.07;
        else if (e.key === "ArrowUp") v.vPitch = -dLon * 0.05;
        else if (e.key === "ArrowDown") v.vPitch = dLon * 0.05;
        else if (e.key === "Enter" || e.key === " ") setOpen(frontTile());
        else return;
        e.preventDefault();
      }}
      onPointerEnter={() => (view.current.hover = true)}
      onPointerLeave={() => (view.current.hover = false)}
      onPointerDown={(e) => {
        if (open !== null) return;
        const tile = (e.target as HTMLElement).closest<HTMLElement>("[data-tile]");
        e.currentTarget.setPointerCapture(e.pointerId);
        view.current.drag = { x: e.clientX, y: e.clientY, lx: e.clientX, ly: e.clientY, moved: false, tile: tile ? Number(tile.dataset.tile) : -1 };
        view.current.vYaw = view.current.vPitch = 0;
      }}
      onPointerMove={(e) => {
        const v = view.current;
        const d = v.drag;
        if (!d) return;
        const dx = e.clientX - d.lx;
        const dy = e.clientY - d.ly;
        d.lx = e.clientX;
        d.ly = e.clientY;
        if (Math.hypot(e.clientX - d.x, e.clientY - d.y) > 5) d.moved = true;
        v.yaw -= dx * dragSensitivity;
        v.pitch = Math.max(-maxPitch - 8, Math.min(maxPitch + 8, v.pitch + dy * dragSensitivity));
        v.vYaw = -dx * dragSensitivity;
        v.vPitch = dy * dragSensitivity * 0.5;
      }}
      onPointerUp={() => {
        const d = view.current.drag;
        view.current.drag = null;
        if (d && !d.moved && d.tile >= 0) setOpen(d.tile);
      }}
      onPointerCancel={() => (view.current.drag = null)}
      className={`relative size-full cursor-grab touch-none select-none overflow-hidden outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring active:cursor-grabbing ${className ?? ""}`}
    >
      <div
        className="absolute inset-0"
        style={{
          perspective: radius,
          maskImage: "radial-gradient(ellipse at center, #000 40%, transparent 95%)",
          WebkitMaskImage: "radial-gradient(ellipse at center, #000 40%, transparent 95%)",
        }}
      >
        <div ref={sphere} className="absolute left-1/2 top-1/2" style={{ transformStyle: "preserve-3d", transform: `translateZ(${radius}px)` }}>
          {tiles.map((t, i) => (
            <div
              key={i}
              data-tile={i}
              ref={(el) => {
                tileEls.current[i] = el;
              }}
              className="absolute overflow-hidden bg-muted"
              style={{
                width: size,
                height: size,
                left: -size / 2,
                top: -size / 2,
                borderRadius: tileRadius,
                backfaceVisibility: "hidden",
                visibility: "hidden",
                transform: `rotateY(${t.lon}deg) rotateX(${t.lat}deg) translateZ(${-radius}px)`,
              }}
            >
              <img src={t.src} alt="" draggable={false} loading="lazy" className="pointer-events-none size-full object-cover" />
            </div>
          ))}
        </div>
      </div>

      <AnimatePresence>
        {open !== null && (
          <motion.div
            className="absolute inset-0 z-10 grid cursor-zoom-out place-items-center bg-background/60 p-8 backdrop-blur-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={close}
            role="dialog"
            aria-modal="true"
            aria-label="Enlarged photo"
          >
            <motion.img
              src={tiles[open]?.src}
              alt=""
              className="max-h-full max-w-full rounded-2xl object-cover shadow-2xl"
              style={{ width: Math.min(460, radius), aspectRatio: "1" }}
              initial={{ scale: 0.4, rotateX: 20, opacity: 0 }}
              animate={{ scale: 1, rotateX: 0, opacity: 1 }}
              exit={{ scale: 0.6, opacity: 0 }}
              transition={{ type: "spring", stiffness: 260, damping: 24 }}
            />
            <button
              ref={closeBtn}
              type="button"
              aria-label="Close"
              onClick={close}
              className="absolute right-4 top-4 grid size-10 place-items-center rounded-full border border-border bg-card text-foreground outline-none hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring"
            >
              <X className="size-5" aria-hidden />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
