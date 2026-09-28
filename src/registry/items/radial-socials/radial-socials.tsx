"use client";

import { useEffect, useId, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { AnimatePresence, MotionConfig, motion } from "motion/react";
import { Share2, X } from "lucide-react";
import { cn } from "@/lib/utils";

export interface RadialSocialItem {
  label: string;
  href: string;
  icon: ReactNode;
  /** Brand color used as the hover fill. */
  color?: string;
}

export interface RadialSocialsProps {
  items: RadialSocialItem[];
  /** Distance from the center button to each icon, in px. */
  radius?: number;
  /** Direction the arc faces, in degrees (-90 is up, 0 is right). */
  angle?: number;
  /** Width of the arc in degrees. 360 makes a full ring. */
  spread?: number;
  /** Seconds between each icon springing out. */
  stagger?: number;
  /** Start opened. */
  defaultOpen?: boolean;
  /** Accessible label of the center button. */
  label?: string;
  /** Show a faint guide arc behind the icons. */
  guide?: boolean;
  className?: string;
}

export function RadialSocials({
  items,
  radius = 120,
  angle = -90,
  spread = 180,
  stagger = 0.05,
  defaultOpen = false,
  label = "Share",
  guide = true,
  className,
}: RadialSocialsProps) {
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const id = useId();
  const n = items.length;

  // Open after mount so a defaultOpen fan still springs out instead of popping in.
  useEffect(() => {
    if (!defaultOpen) return;
    const t = window.setTimeout(() => setOpen(true), 350);
    return () => window.clearTimeout(t);
  }, [defaultOpen]);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      if (!root.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", onDown);
    return () => document.removeEventListener("pointerdown", onDown);
  }, [open]);

  const full = spread >= 360;
  const angles = items.map((_, i) => {
    const t = n === 1 ? 0.5 : full ? i / n : i / (n - 1);
    return ((angle - (full ? 0 : spread / 2) + t * (full ? 360 : spread)) * Math.PI) / 180;
  });

  // Guide arc (SVG sweep through the icon angles).
  const box = radius * 2 + 80;
  const c = box / 2;
  const a0 = full ? 0 : ((angle - spread / 2) * Math.PI) / 180;
  const a1 = full ? Math.PI * 2 - 0.001 : ((angle + spread / 2) * Math.PI) / 180;
  const arc = `M${c + Math.cos(a0) * radius},${c + Math.sin(a0) * radius} A${radius},${radius} 0 ${a1 - a0 > Math.PI ? 1 : 0} 1 ${c + Math.cos(a1) * radius},${c + Math.sin(a1) * radius}`;

  return (
    <MotionConfig reducedMotion="user">
      <div
        ref={root}
        className={cn("relative grid size-16 place-items-center", className)}
        onKeyDown={(e) => {
          if (e.key === "Escape" && open) {
            setOpen(false);
            trigger.current?.focus();
          }
        }}
      >
        {guide && (
          <svg aria-hidden width={box} height={box} className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 overflow-visible">
            <motion.path
              d={arc}
              fill="none"
              stroke="currentColor"
              strokeWidth={1}
              strokeDasharray="2 6"
              strokeLinecap="round"
              className="text-foreground/25"
              initial={false}
              animate={{ pathLength: open ? 1 : 0, opacity: open ? 1 : 0 }}
              transition={{ duration: open ? 0.6 : 0.3, ease: [0.2, 0.8, 0.2, 1] }}
            />
          </svg>
        )}

        <ul id={`${id}-list`} className="contents">
          {items.map((it, i) => {
            const x = Math.cos(angles[i]) * radius;
            const y = Math.sin(angles[i]) * radius;
            return (
              <motion.li
                key={it.label}
                className="absolute left-1/2 top-1/2 -ml-6 -mt-6 list-none"
                initial={false}
                animate={open ? { x, y, scale: 1, opacity: 1, rotate: 0 } : { x: 0, y: 0, scale: 0.3, opacity: 0, rotate: -120 }}
                transition={{
                  type: "spring",
                  stiffness: open ? 360 : 500,
                  damping: open ? 20 : 34,
                  delay: open ? i * stagger : (n - 1 - i) * stagger * 0.5,
                }}
                style={{ pointerEvents: open ? "auto" : "none" }}
              >
                <a
                  href={it.href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={it.label}
                  tabIndex={open ? 0 : -1}
                  aria-hidden={!open}
                  className="group/rs relative grid size-12 place-items-center rounded-full border border-border bg-card text-foreground shadow-[0_10px_30px_-10px_rgba(0,0,0,.6)] outline-none transition-[background-color,color,border-color,transform,box-shadow] duration-200 hover:-translate-y-0.5 hover:border-transparent hover:bg-[var(--c)] hover:text-white hover:shadow-[0_10px_30px_-6px_var(--c)] focus-visible:ring-2 focus-visible:ring-ring [&_svg]:size-5"
                  style={{ ["--c" as string]: it.color ?? "var(--foreground)" } as CSSProperties}
                >
                  {it.icon}
                  <span className="pointer-events-none absolute bottom-full left-1/2 mb-2 -translate-x-1/2 translate-y-1 whitespace-nowrap rounded-md border border-border bg-card px-2 py-1 text-xs font-medium text-foreground opacity-0 shadow-md transition duration-150 group-hover/rs:translate-y-0 group-hover/rs:opacity-100 group-focus-visible/rs:translate-y-0 group-focus-visible/rs:opacity-100">
                    {it.label}
                  </span>
                </a>
              </motion.li>
            );
          })}
        </ul>

        {/* Idle ping so the button reads as interactive. */}
        {!open && (
          <span aria-hidden className="absolute inset-0 animate-ping rounded-full bg-foreground/15 [animation-duration:2.4s] motion-reduce:hidden" />
        )}
        <motion.button
          ref={trigger}
          type="button"
          aria-label={open ? `Close ${label.toLowerCase()} menu` : label}
          aria-expanded={open}
          aria-controls={`${id}-list`}
          onClick={() => setOpen((o) => !o)}
          whileTap={{ scale: 0.9 }}
          className="relative z-10 grid size-16 place-items-center rounded-full bg-foreground text-background shadow-[0_16px_40px_-12px_rgba(0,0,0,.7)] outline-none ring-offset-2 ring-offset-background transition-shadow focus-visible:ring-2 focus-visible:ring-ring"
        >
          <AnimatePresence initial={false} mode="popLayout">
            <motion.span
              key={open ? "x" : "share"}
              initial={{ rotate: -90, scale: 0.4, opacity: 0 }}
              animate={{ rotate: 0, scale: 1, opacity: 1 }}
              exit={{ rotate: 90, scale: 0.4, opacity: 0 }}
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
              className="grid place-items-center"
            >
              {open ? <X className="size-6" aria-hidden /> : <Share2 className="size-6" aria-hidden />}
            </motion.span>
          </AnimatePresence>
        </motion.button>
      </div>
    </MotionConfig>
  );
}
