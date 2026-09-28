"use client";

import { useId, useRef, useState, type KeyboardEvent, type PointerEvent, type ReactNode } from "react";

export interface SplitterProps {
  /** First pane (left or top). */
  start: ReactNode;
  /** Second pane (right or bottom). */
  end: ReactNode;
  /** "horizontal" puts panes side by side, "vertical" stacks them. */
  direction?: "horizontal" | "vertical";
  /** Initial size of the first pane, in % of the container. */
  defaultSize?: number;
  /** Smallest size of the first pane, in %. */
  minSize?: number;
  /** Largest size of the first pane, in %. */
  maxSize?: number;
  /** % moved per arrow key press (Shift moves 4x). */
  step?: number;
  /** Accessible name for the handle. */
  label?: string;
  onResize?: (size: number) => void;
  className?: string;
}

const round = (v: number) => Math.round(v * 10) / 10;

export function Splitter({
  start,
  end,
  direction = "horizontal",
  defaultSize = 28,
  minSize = 15,
  maxSize = 85,
  step = 5,
  label = "Resize panels",
  onResize,
  className,
}: SplitterProps) {
  const lo = Math.min(minSize, maxSize);
  const hi = Math.max(minSize, maxSize);
  const clamp = (v: number) => Math.min(hi, Math.max(lo, v));
  const horizontal = direction === "horizontal";

  const [size, setSize] = useState(() => clamp(defaultSize));
  // Playground/prop changes reset the split (render-time sync, no effect needed).
  const [prev, setPrev] = useState({ defaultSize, lo, hi });
  if (prev.defaultSize !== defaultSize || prev.lo !== lo || prev.hi !== hi) {
    setPrev({ defaultSize, lo, hi });
    setSize(clamp(defaultSize));
  }

  const root = useRef<HTMLDivElement>(null);
  const handle = useRef<HTMLDivElement>(null);
  const live = useRef(size);
  const dragging = useRef(false);
  const id = useId();

  // During a drag we write straight to the DOM; React only hears about the final size.
  const paint = (v: number) => {
    live.current = v;
    root.current?.style.setProperty("--split", `${v}%`);
    handle.current?.setAttribute("aria-valuenow", String(Math.round(v)));
  };

  const commit = (v: number) => {
    const next = round(clamp(v));
    paint(next);
    setSize(next);
    onResize?.(next);
  };

  const fromPointer = (e: PointerEvent) => {
    const r = root.current!.getBoundingClientRect();
    const p = horizontal ? (e.clientX - r.left) / r.width : (e.clientY - r.top) / r.height;
    return clamp(p * 100);
  };

  const onDown = (e: PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0) return;
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);
    e.currentTarget.focus({ preventScroll: true });
    dragging.current = true;
    root.current!.dataset.dragging = "";
  };
  const onMove = (e: PointerEvent<HTMLDivElement>) => {
    if (dragging.current) paint(fromPointer(e));
  };
  const onUp = () => {
    if (!dragging.current) return;
    dragging.current = false;
    delete root.current!.dataset.dragging;
    commit(live.current);
  };

  const onKey = (e: KeyboardEvent<HTMLDivElement>) => {
    const s = e.shiftKey ? step * 4 : step;
    const back = horizontal ? "ArrowLeft" : "ArrowUp";
    const fwd = horizontal ? "ArrowRight" : "ArrowDown";
    let next: number | null = null;
    if (e.key === back) next = size - s;
    else if (e.key === fwd) next = size + s;
    else if (e.key === "Home") next = lo;
    else if (e.key === "End") next = hi;
    // Enter toggles between collapsed-to-min and the default split.
    else if (e.key === "Enter") next = size > lo ? lo : defaultSize;
    if (next === null) return;
    e.preventDefault();
    commit(next);
  };

  return (
    <div
      ref={root}
      className={`group/splitter relative flex h-full w-full overflow-hidden ${horizontal ? "flex-row" : "flex-col"} ${className ?? ""}`}
      style={{ ["--split" as string]: `${size}%` }}
    >
      <style href="splitter" precedence="default">{`
        .splitter-pane{transition:flex-basis .32s cubic-bezier(.2,.8,.2,1)}
        [data-dragging] .splitter-pane{transition:none}
        [data-dragging]{cursor:var(--splitter-cursor);user-select:none}
        @media (prefers-reduced-motion: reduce){.splitter-pane{transition:none}}
      `}</style>
      <div id={`${id}-a`} className="splitter-pane min-h-0 min-w-0 overflow-auto" style={{ flex: "0 0 var(--split)" }}>
        {start}
      </div>

      <div
        ref={handle}
        role="separator"
        tabIndex={0}
        aria-label={label}
        aria-controls={`${id}-a`}
        aria-orientation={horizontal ? "vertical" : "horizontal"}
        aria-valuenow={Math.round(size)}
        aria-valuemin={Math.round(lo)}
        aria-valuemax={Math.round(hi)}
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerCancel={onUp}
        onKeyDown={onKey}
        onDoubleClick={() => commit(defaultSize)}
        className={`group/handle relative z-10 flex shrink-0 touch-none items-center justify-center outline-none ${
          horizontal ? "-mx-1.5 w-3 cursor-col-resize flex-col" : "-my-1.5 h-3 cursor-row-resize flex-row"
        }`}
        style={{ ["--splitter-cursor" as string]: horizontal ? "col-resize" : "row-resize" }}
      >
        {/* Hairline that brightens on hover/drag/focus. */}
        <span
          aria-hidden
          className={`absolute bg-border transition-[background-color,box-shadow] duration-200 group-hover/handle:bg-foreground/35 group-focus-visible/handle:bg-ring group-data-[dragging]/splitter:bg-ring group-data-[dragging]/splitter:shadow-[0_0_12px_var(--ring)] ${
            horizontal ? "inset-y-0 left-1/2 w-px -translate-x-1/2" : "inset-x-0 top-1/2 h-px -translate-y-1/2"
          }`}
        />
        {/* Grip pill. */}
        <span
          aria-hidden
          className={`relative flex items-center justify-center gap-[3px] rounded-full border border-border bg-card shadow-sm transition-[transform,border-color] duration-200 group-hover/handle:scale-110 group-hover/handle:border-foreground/30 group-focus-visible/handle:border-ring group-focus-visible/handle:ring-2 group-focus-visible/handle:ring-ring/40 group-data-[dragging]/splitter:scale-110 group-data-[dragging]/splitter:border-ring ${
            horizontal ? "h-8 w-3 flex-col" : "h-3 w-8 flex-row"
          }`}
        >
          {[0, 1, 2].map((i) => (
            <span key={i} className="size-[3px] rounded-full bg-muted-foreground" />
          ))}
        </span>
      </div>

      <div className="splitter-pane min-h-0 min-w-0 flex-1 overflow-auto">{end}</div>
    </div>
  );
}
