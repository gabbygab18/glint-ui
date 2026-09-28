"use client";

import { useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface Layer {
  label: string;
  /** What is drawn on this layer. Fills the layer box. */
  content: ReactNode;
  /** Small icon shown in the layers panel. */
  icon?: ReactNode;
}

export interface LayerStackProps {
  /** First item is the top-most layer. */
  layers: Layer[];
  /** Layer width in px. */
  width?: number;
  /** Layer height in px. */
  height?: number;
  /** Px between layers when fanned out. */
  spread?: number;
  /** Px between layers at rest. */
  restGap?: number;
  /** Camera pitch in degrees (0 = flat, 90 = edge-on). */
  pitch?: number;
  /** Keep the stack fanned out without hover. */
  expanded?: boolean;
  /** Show a Figma-style layers panel next to the stack. */
  showPanel?: boolean;
  className?: string;
}

const EASE = "cubic-bezier(.2,.8,.2,1)";

export function LayerStack({
  layers,
  width = 260,
  height = 180,
  spread = 56,
  restGap = 6,
  pitch = 56,
  expanded = false,
  showPanel = true,
  className,
}: LayerStackProps) {
  const [hover, setHover] = useState(false);
  const [active, setActive] = useState<number | null>(null);
  const open = expanded || hover || active !== null;
  const n = layers.length;
  const gap = open ? spread : restGap;
  const rad = (pitch * Math.PI) / 180;
  // Reserve the fanned-out footprint up front, so opening never spills out of the box:
  // the rotated plane, the full vertical run of the spread stack (plus the active layer's lift),
  // and room on the right for the labels.
  const LABEL_ROOM = 160;
  const planeW = (width + height) * Math.SQRT1_2 + 40;
  const stageW = planeW + LABEL_ROOM;
  const stageH = (width + height) * Math.SQRT1_2 * Math.cos(rad) + ((n - 1) * spread + 18) * Math.sin(rad) + 90;
  const plane = `rotateX(${pitch}deg) rotateZ(-45deg)`;
  const unplane = `rotateZ(45deg) rotateX(${-pitch}deg)`;

  return (
    <div
      className={cn("flex items-center gap-8", className)}
      onPointerLeave={() => {
        setHover(false);
        setActive(null);
      }}
    >
      {showPanel && (
        <div role="list" aria-label="Layers" className="w-44 shrink-0 rounded-xl border border-border bg-card/80 p-1.5 shadow-xl backdrop-blur">
          <p className="px-2.5 pt-1.5 pb-2 text-[11px] font-medium tracking-wider text-muted-foreground uppercase">Layers</p>
          {layers.map((layer, i) => (
            <div role="listitem" key={layer.label}>
              <button
                type="button"
                onPointerEnter={() => setActive(i)}
                onFocus={() => setActive(i)}
                onBlur={() => setActive(null)}
                className={cn(
                  "flex w-full items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-left text-[13px] outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring",
                  active === i ? "bg-muted text-foreground" : "text-muted-foreground hover:text-foreground",
                )}
              >
                <span aria-hidden className="grid size-4 place-items-center [&>svg]:size-full">
                  {layer.icon ?? <span className="size-2.5 rounded-sm border border-current" />}
                </span>
                {layer.label}
              </button>
            </div>
          ))}
        </div>
      )}

      <div
        aria-hidden
        className="relative shrink-0"
        style={{ width: stageW, height: stageH }}
        onPointerEnter={() => setHover(true)}
      >
        <div className="absolute top-1/2" style={{ left: planeW / 2, transformStyle: "preserve-3d", transform: plane }}>
          {layers.map((layer, i) => {
            const z = (n - 1 - i - (n - 1) / 2) * gap + (active === i ? 18 : 0);
            const dim = active !== null && active !== i;
            // Stagger outward on open, inward on close.
            const delay = (open ? i : n - 1 - i) * 35;
            return (
              <div
                key={layer.label}
                onPointerEnter={() => setActive(i)}
                className="absolute motion-reduce:!transition-none"
                style={{
                  width,
                  height,
                  left: -width / 2,
                  top: -height / 2,
                  transformStyle: "preserve-3d",
                  transform: `translate3d(0,0,${z}px)`,
                  opacity: dim ? 0.35 : 1,
                  transition: `transform .7s ${EASE} ${delay}ms, opacity .35s`,
                }}
              >
                <div
                  className={cn(
                    "absolute inset-0 overflow-hidden rounded-2xl border transition-[border-color,box-shadow] duration-300",
                    active === i ? "border-lime-300/80" : "border-white/15",
                  )}
                  style={{
                    background: "color-mix(in oklab, var(--card) 22%, transparent)",
                    boxShadow: open ? "0 30px 40px -20px rgba(0,0,0,.55)" : "none",
                  }}
                >
                  {layer.content}
                </div>
                {/* Label pinned to the right-hand corner, rotated back to face the viewer. */}
                <div className="absolute top-full left-full" style={{ transformStyle: "preserve-3d" }}>
                  <div
                    className="flex origin-top-left items-center gap-2 whitespace-nowrap motion-reduce:!transition-none"
                    style={{
                      transform: `${unplane} translate(10px,-50%)`,
                      opacity: open ? 1 : 0,
                      transition: `opacity .4s ${open ? delay + 150 : 0}ms`,
                    }}
                  >
                    <span className={cn("h-px w-6", active === i ? "bg-lime-300" : "bg-foreground/30")} />
                    <span
                      className={cn(
                        "rounded-md border px-2 py-0.5 text-[11px] font-medium",
                        active === i ? "border-lime-300/60 bg-lime-300 text-black" : "border-border bg-card/90 text-muted-foreground",
                      )}
                    >
                      {String(i + 1).padStart(2, "0")} {layer.label}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
