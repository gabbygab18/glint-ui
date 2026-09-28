"use client";

import { useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface FolderProps {
  /** Folder color (any CSS color). */
  color?: string;
  /** Folder width in px. */
  size?: number;
  /** Up to three paper cards revealed when open. */
  items?: ReactNode[];
  /** Text under the folder. */
  label?: string;
  /** Open while hovered, not only on click. */
  openOnHover?: boolean;
  className?: string;
}

const SPRING = "cubic-bezier(.34,1.45,.5,1)";

// Where each paper lands when the folder opens: [x %, y %, rotation deg].
const FAN = [
  [-46, -26, -13],
  [0, -40, 0],
  [46, -26, 13],
] as const;

function Lines() {
  return (
    <div className="flex h-full flex-col gap-[9%] p-[14%]">
      <span className="h-[7%] w-3/5 rounded-full bg-black/25" />
      <span className="h-[5%] w-full rounded-full bg-black/10" />
      <span className="h-[5%] w-4/5 rounded-full bg-black/10" />
      <span className="h-[5%] w-full rounded-full bg-black/10" />
    </div>
  );
}

export function Folder({
  color = "#5b8cff",
  size = 180,
  items = [<Lines key={0} />, <Lines key={1} />, <Lines key={2} />],
  label,
  openOnHover = true,
  className,
}: FolderProps) {
  const [pinned, setPinned] = useState(false);
  const [hover, setHover] = useState(false);
  const open = pinned || (openOnHover && hover);
  const papers = items.slice(0, 3);
  const back = `color-mix(in oklab, ${color} 72%, black)`;

  return (
    <div className={cn("inline-flex flex-col items-center gap-4", className)}>
      <button
        type="button"
        aria-expanded={open}
        aria-label={label ? `${label} folder` : "Folder"}
        onClick={() => setPinned((p) => !p)}
        onKeyDown={(e) => e.key === "Escape" && setPinned(false)}
        onPointerEnter={() => setHover(true)}
        onPointerLeave={() => setHover(false)}
        className="relative rounded-2xl outline-none ring-ring ring-offset-4 ring-offset-background transition-transform duration-300 focus-visible:ring-2 active:scale-[.97]"
        style={{ width: size, height: size * 0.78, perspective: size * 4 }}
      >
        {/* back panel with tab */}
        <span className="absolute inset-0 rounded-[10%] rounded-tl-none" style={{ background: back }} />
        <span
          className="absolute bottom-full left-0 h-[14%] w-[42%] rounded-t-[30%]"
          style={{ background: back, clipPath: "polygon(0 0, 78% 0, 100% 100%, 0 100%)" }}
        />
        {papers.map((node, i) => {
          const [x, y, r] = FAN[papers.length === 1 ? 1 : papers.length === 2 ? i * 2 : i];
          return (
            <span
              key={i}
              aria-hidden={!open}
              className="absolute left-[18%] top-[8%] h-[80%] w-[64%] overflow-hidden rounded-[8%] bg-white shadow-[0_10px_30px_-8px_rgba(0,0,0,.45)]"
              style={{
                transform: open
                  ? `translate(${x}%, ${y}%) rotate(${r}deg)`
                  : `translate(0, ${6 - i * 4}%) rotate(${(i - 1) * 2}deg)`,
                transition: `transform .6s ${SPRING} ${open ? i * 0.05 : (2 - i) * 0.03}s`,
                zIndex: i === 1 ? 2 : 1,
              }}
            >
              {node}
            </span>
          );
        })}
        {/* front panel: hinges toward the viewer */}
        <span
          className="absolute inset-x-0 bottom-0 z-10 h-[86%] rounded-[10%]"
          style={{
            background: `linear-gradient(180deg, color-mix(in oklab, ${color} 88%, white), ${color} 40%, color-mix(in oklab, ${color} 88%, black))`,
            boxShadow: "inset 0 1px 0 rgba(255,255,255,.35), 0 -6px 18px -8px rgba(0,0,0,.35)",
            transformOrigin: "50% 100%",
            transform: open ? "rotateX(-34deg) scaleY(.94)" : "none",
            transition: `transform .55s ${SPRING}`,
          }}
        >
          <span className="absolute inset-x-[12%] bottom-[14%] h-[3%] rounded-full bg-white/25" />
        </span>
      </button>
      {label && <span className="text-sm font-medium text-foreground">{label}</span>}
    </div>
  );
}
