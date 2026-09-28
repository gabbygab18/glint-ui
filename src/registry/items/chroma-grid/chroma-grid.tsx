"use client";
/* eslint-disable @next/next/no-img-element */

import { useEffect, useRef, type PointerEvent } from "react";

export interface ChromaGridItem {
  image: string;
  title: string;
  subtitle?: string;
  handle?: string;
  /** Accent used for the card gradient and hover border. */
  color?: string;
  url?: string;
}

export interface ChromaGridProps {
  items: ChromaGridItem[];
  /** Spotlight radius in px. */
  radius?: number;
  /** Cursor follow smoothing, 0-1 (higher = snappier). */
  smoothing?: number;
  /** Grid columns on wide screens. */
  columns?: number;
  className?: string;
}

export function ChromaGrid({ items, radius = 280, smoothing = 0.12, columns = 3, className }: ChromaGridProps) {
  const root = useRef<HTMLDivElement>(null);
  const target = useRef({ x: 0, y: 0, r: 0 });
  const kick = useRef(() => {});

  useEffect(() => {
    const el = root.current!;
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const cur = { x: el.clientWidth / 2, y: el.clientHeight / 2, r: 0 };
    target.current = { ...cur };
    let raf = 0;
    // Ease the spotlight towards the pointer; the loop stops itself once settled.
    const tick = () => {
      const t = target.current;
      const k = reduce ? 1 : smoothing;
      cur.x += (t.x - cur.x) * k;
      cur.y += (t.y - cur.y) * k;
      cur.r += (t.r - cur.r) * (reduce ? 1 : 0.08);
      el.style.setProperty("--cx", `${cur.x}px`);
      el.style.setProperty("--cy", `${cur.y}px`);
      el.style.setProperty("--cr", `${cur.r}px`);
      raf = Math.abs(t.x - cur.x) + Math.abs(t.y - cur.y) + Math.abs(t.r - cur.r) > 0.3 ? requestAnimationFrame(tick) : 0;
    };
    kick.current = () => {
      if (!raf) raf = requestAnimationFrame(tick);
    };
    return () => {
      cancelAnimationFrame(raf);
      kick.current = () => {};
    };
  }, [smoothing]);

  const moveTo = (x: number, y: number, r: number) => {
    target.current = { x, y, r };
    kick.current();
  };

  const onMove = (e: PointerEvent<HTMLDivElement>) => {
    const b = e.currentTarget.getBoundingClientRect();
    moveTo(e.clientX - b.left, e.clientY - b.top, radius);
  };

  const onCardMove = (e: PointerEvent<HTMLElement>) => {
    const b = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty("--mx", `${e.clientX - b.left}px`);
    e.currentTarget.style.setProperty("--my", `${e.clientY - b.top}px`);
  };

  const mask =
    "radial-gradient(circle var(--cr) at var(--cx) var(--cy), transparent 0%, transparent 15%, rgba(0,0,0,.1) 45%, rgba(0,0,0,.35) 60%, rgba(0,0,0,.6) 75%, rgba(0,0,0,.85) 88%, #000 100%)";

  return (
    <div
      ref={root}
      onPointerMove={onMove}
      onPointerLeave={() => moveTo(target.current.x, target.current.y, 0)}
      className={`relative grid w-full gap-3 max-sm:!grid-cols-2 ${className ?? ""}`}
      style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`, maxWidth: columns * 260, ["--cr" as string]: "0px" }}
    >
      {items.map((item) => {
        const Tag = item.url ? "a" : "article";
        return (
          <Tag
            key={item.title}
            href={item.url}
            tabIndex={0}
            onPointerMove={onCardMove}
            onFocus={(e) => {
              const b = e.currentTarget.getBoundingClientRect();
              const g = root.current!.getBoundingClientRect();
              moveTo(b.left - g.left + b.width / 2, b.top - g.top + b.height / 2, radius);
            }}
            onBlur={() => moveTo(target.current.x, target.current.y, 0)}
            className="group relative flex flex-col overflow-hidden rounded-2xl border border-transparent p-2 outline-none transition-[border-color] duration-300 hover:border-[var(--accent)] focus-visible:border-[var(--accent)]"
            style={{
              ["--accent" as string]: item.color ?? "#8b5cf6",
              background: `linear-gradient(160deg, ${item.color ?? "#8b5cf6"}, #0a0a0a 70%)`,
            }}
          >
            {/* Per-card glare that follows the pointer. */}
            <span
              aria-hidden
              className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
              style={{ background: "radial-gradient(260px circle at var(--mx, 50%) var(--my, 50%), rgba(255,255,255,.18), transparent 60%)" }}
            />
            <img src={item.image} alt="" draggable={false} className="relative aspect-[4/3] w-full rounded-xl object-cover" />
            <footer className="relative grid grid-cols-[1fr_auto] gap-x-2 px-2 pb-1 pt-3 text-white">
              <h3 className="truncate font-semibold">{item.title}</h3>
              {item.handle && <span className="text-sm text-white/60">{item.handle}</span>}
              {item.subtitle && <p className="col-span-2 truncate text-sm text-white/75">{item.subtitle}</p>}
            </footer>
          </Tag>
        );
      })}
      {/* Grayscale everything except a soft hole around the spotlight. */}
      <div
        aria-hidden
        className="pointer-events-none absolute -inset-px z-10 rounded-2xl"
        style={{
          backdropFilter: "grayscale(1) brightness(.78)",
          WebkitBackdropFilter: "grayscale(1) brightness(.78)",
          maskImage: mask,
          WebkitMaskImage: mask,
        }}
      />
    </div>
  );
}
