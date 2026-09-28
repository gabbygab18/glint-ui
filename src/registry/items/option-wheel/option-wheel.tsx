"use client";

import { useEffect, useId, useRef, useState, type KeyboardEvent, type PointerEvent } from "react";

export interface OptionWheelProps {
  options: string[];
  /** Initially selected index. */
  defaultIndex?: number;
  onChange?: (value: string, index: number) => void;
  /** Row height in px. */
  itemHeight?: number;
  /** Rows visible at once (odd numbers look best). */
  visibleCount?: number;
  /** Degrees each row turns away from the center: the cylinder's curvature. */
  curvature?: number;
  /** Loop the wheel so it never hits an end. */
  loop?: boolean;
  /** Accessible name. */
  label?: string;
  className?: string;
}

const LOOP_COPIES = 21;

export function OptionWheel({
  options,
  defaultIndex = 0,
  onChange,
  itemHeight = 40,
  visibleCount = 5,
  curvature = 20,
  loop = false,
  label = "Options",
  className,
}: OptionWheelProps) {
  const scroller = useRef<HTMLDivElement>(null);
  const rows = useRef<(HTMLDivElement | null)[]>([]);
  const n = options.length;
  const copies = loop ? LOOP_COPIES : 1;
  const total = n * copies;
  const base = loop ? n * Math.floor(copies / 2) : 0;
  const [selected, setSelected] = useState(() => Math.min(Math.max(defaultIndex, 0), n - 1));
  const selectedRef = useRef(selected);
  const onChangeRef = useRef(onChange);
  const id = useId();
  const pad = ((visibleCount - 1) / 2) * itemHeight;

  useEffect(() => {
    onChangeRef.current = onChange;
  });

  // Scroll -> 3D cylinder. Rows stay in normal flow (so native scroll + snap do the physics);
  // each one is pushed onto a cylinder of radius R around the viewport's center line.
  useEffect(() => {
    const el = scroller.current!;
    const rad = (curvature * Math.PI) / 180;
    const R = rad > 0 ? itemHeight / rad : 0;
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    let raf = 0;
    let settle = 0;

    const paint = () => {
      raf = 0;
      const center = el.scrollTop / itemHeight;
      for (let i = 0; i < rows.current.length; i++) {
        const row = rows.current[i];
        if (!row) continue;
        const d = i - center;
        if (Math.abs(d) > visibleCount) {
          row.style.visibility = "hidden";
          continue;
        }
        row.style.visibility = "";
        const theta = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, d * rad));
        const y = R ? R * Math.sin(theta) - d * itemHeight : 0;
        const z = R ? R * Math.cos(theta) - R : 0;
        row.style.transform = `translate3d(0, ${y}px, ${z}px) rotateX(${(-theta * 180) / Math.PI}deg)`;
        row.style.opacity = String(Math.max(0, 1 - Math.abs(d) * (0.7 / ((visibleCount - 1) / 2 || 1))));
      }
    };

    const commit = () => {
      let i = Math.round(el.scrollTop / itemHeight);
      // Loop mode: quietly jump back to the middle copy so the wheel never runs out.
      if (loop && (i < n * 3 || i > total - n * 3)) {
        const mid = base + (((i % n) + n) % n);
        el.scrollTop += (mid - i) * itemHeight;
        i = mid;
      }
      const idx = ((i % n) + n) % n;
      if (idx !== selectedRef.current) {
        selectedRef.current = idx;
        setSelected(idx);
        onChangeRef.current?.(options[idx], idx);
        if (!reduce) navigator.vibrate?.(4);
      }
    };

    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(paint);
      clearTimeout(settle);
      settle = window.setTimeout(commit, 120);
    };

    el.scrollTop = (base + selectedRef.current) * itemHeight;
    paint();
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(settle);
      el.removeEventListener("scroll", onScroll);
    };
  }, [itemHeight, visibleCount, curvature, loop, n, total, base, options]);

  const scrollToIndex = (i: number, smooth = true) => {
    const el = scroller.current!;
    const current = Math.round(el.scrollTop / itemHeight);
    const target = loop ? current + i - (((current % n) + n) % n) : Math.max(0, Math.min(n - 1, i));
    el.scrollTo({ top: target * itemHeight, behavior: smooth ? "smooth" : "auto" });
  };

  const stepBy = (delta: number) => {
    const el = scroller.current!;
    const current = Math.round(el.scrollTop / itemHeight);
    const target = loop ? current + delta : Math.max(0, Math.min(n - 1, current + delta));
    el.scrollTo({ top: target * itemHeight, behavior: "smooth" });
  };

  const onKey = (e: KeyboardEvent<HTMLDivElement>) => {
    const map: Record<string, () => void> = {
      ArrowUp: () => stepBy(-1),
      ArrowDown: () => stepBy(1),
      PageUp: () => stepBy(-(visibleCount - 1)),
      PageDown: () => stepBy(visibleCount - 1),
      Home: () => scrollToIndex(0),
      End: () => scrollToIndex(n - 1),
    };
    if (!map[e.key]) return;
    e.preventDefault();
    map[e.key]();
  };

  // Mouse drag (touch already scrolls natively). Snap is off while dragging, then we fling + snap.
  const drag = useRef<{ y: number; top: number; t: number; v: number; moved: boolean } | null>(null);
  const onDown = (e: PointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== "mouse" || e.button !== 0) return;
    const el = scroller.current!;
    drag.current = { y: e.clientY, top: el.scrollTop, t: e.timeStamp, v: 0, moved: false };
  };
  const onMove = (e: PointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    if (!d) return;
    if (!e.buttons) return onUp();
    const el = scroller.current!;
    // Capture only once it is a real drag, so a plain click still reaches the row under the pointer.
    if (!d.moved) {
      if (Math.abs(e.clientY - d.y) <= 3) return;
      d.moved = true;
      el.style.scrollSnapType = "none";
      e.currentTarget.setPointerCapture(e.pointerId);
    }
    const now = e.timeStamp;
    const prev = el.scrollTop;
    el.scrollTop = d.top - (e.clientY - d.y);
    d.v = (el.scrollTop - prev) / Math.max(1, now - d.t);
    d.t = now;
  };
  const onUp = () => {
    const d = drag.current;
    if (!d) return;
    drag.current = null;
    const el = scroller.current!;
    const fling = el.scrollTop + d.v * 180;
    const max = loop ? Infinity : (n - 1) * itemHeight;
    const target = Math.max(0, Math.min(max, Math.round(fling / itemHeight) * itemHeight));
    el.style.scrollSnapType = "";
    if (d.moved) el.scrollTo({ top: target, behavior: "smooth" });
  };

  const height = itemHeight * visibleCount;

  return (
    <div
      className={`relative select-none ${className ?? ""}`}
      style={{ height }}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-1/2 -translate-y-1/2 rounded-xl border border-border bg-muted/70"
        style={{ height: itemHeight }}
      />
      <div
        ref={scroller}
        role="listbox"
        tabIndex={0}
        aria-label={label}
        aria-activedescendant={`${id}-${selected}`}
        onKeyDown={onKey}
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerCancel={onUp}
        className="relative h-full overflow-y-scroll overscroll-contain rounded-xl outline-none [scrollbar-width:none] focus-visible:ring-2 focus-visible:ring-ring [&::-webkit-scrollbar]:hidden"
        style={{
          scrollSnapType: "y mandatory",
          perspective: itemHeight * 16,
          cursor: "grab",
          maskImage: "linear-gradient(to bottom, transparent, #000 30%, #000 70%, transparent)",
        }}
      >
        <div style={{ height: pad }} />
        {Array.from({ length: total }, (_, i) => {
          const idx = i % n;
          const isSel = idx === selected;
          return (
            <div
              key={i}
              ref={(el) => {
                rows.current[i] = el;
              }}
              id={i === base + idx ? `${id}-${idx}` : undefined}
              role="option"
              aria-selected={isSel}
              onClick={() => scroller.current!.scrollTo({ top: i * itemHeight, behavior: "smooth" })}
              className={`grid place-items-center whitespace-nowrap px-4 text-lg tabular-nums transition-colors duration-200 ${isSel ? "font-semibold text-foreground" : "text-muted-foreground"}`}
              style={{ height: itemHeight, scrollSnapAlign: "center", backfaceVisibility: "hidden" }}
            >
              {options[idx]}
            </div>
          );
        })}
        <div style={{ height: pad }} />
      </div>
    </div>
  );
}
