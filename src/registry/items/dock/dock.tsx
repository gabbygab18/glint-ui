"use client";

import { useRef, type PointerEvent, type ReactNode } from "react";

export interface DockItem {
  label: string;
  icon: ReactNode;
  onClick?: () => void;
}

export interface DockProps {
  items: DockItem[];
  /** Resting icon size in px. */
  baseSize?: number;
  /** Icon size right under the cursor, in px. */
  magnification?: number;
  /** Px from the cursor where magnification fades out. */
  distance?: number;
  className?: string;
}

export function Dock({ items, baseSize = 48, magnification = 80, distance = 140, className }: DockProps) {
  const refs = useRef<(HTMLButtonElement | null)[]>([]);

  const onMove = (e: PointerEvent<HTMLDivElement>) => {
    for (const el of refs.current) {
      if (!el) continue;
      const r = el.getBoundingClientRect();
      const d = Math.abs(e.clientX - (r.left + r.width / 2));
      // Cosine falloff: smooth peak under the cursor, zero at `distance`.
      const k = d < distance ? (Math.cos((d / distance) * Math.PI) + 1) / 2 : 0;
      const size = baseSize + (magnification - baseSize) * k;
      el.style.width = el.style.height = `${size}px`;
    }
  };

  const onLeave = () => {
    for (const el of refs.current) if (el) el.style.width = el.style.height = `${baseSize}px`;
  };

  return (
    <div
      onPointerMove={onMove}
      onPointerLeave={onLeave}
      role="toolbar"
      className={`flex items-end gap-3 rounded-2xl border border-border bg-card/70 px-3 pb-2 pt-2 backdrop-blur ${className ?? ""}`}
      style={{ height: baseSize + 16 }}
    >
      {items.map((item, i) => (
        <button
          key={item.label}
          ref={(el) => {
            refs.current[i] = el;
          }}
          type="button"
          aria-label={item.label}
          onClick={item.onClick}
          className="group relative grid shrink-0 place-items-center rounded-xl border border-border bg-muted text-foreground transition-[width,height] duration-100 ease-out focus-visible:outline-2 focus-visible:outline-offset-2"
          style={{ width: baseSize, height: baseSize }}
        >
          <span className="pointer-events-none absolute -top-9 whitespace-nowrap rounded-md border border-border bg-card px-2 py-1 text-xs opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
            {item.label}
          </span>
          <span className="grid size-1/2 place-items-center [&>svg]:size-full">{item.icon}</span>
        </button>
      ))}
    </div>
  );
}
