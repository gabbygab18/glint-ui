"use client";

import { useEffect, useId, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import { AnimatePresence, MotionConfig, motion } from "motion/react";
import { Camera, FileText, ImageIcon, MapPin, Mic, Plus } from "lucide-react";

export interface BranchedMenuItem {
  label: string;
  icon?: ReactNode;
}

export interface BranchedMenuProps {
  /** Sub-actions that sprout at the ends of the branches. */
  items?: BranchedMenuItem[];
  /** Branch length in px. */
  radius?: number;
  /** Fan angle in degrees across which the branches spread. */
  spread?: number;
  /** Branch stroke color. */
  color?: string;
  /** Accessible name of the trigger. */
  label?: string;
  /** Called with the chosen item and its index; the menu then collapses. */
  onSelect?: (item: BranchedMenuItem, index: number) => void;
  className?: string;
}

const defaultItems: BranchedMenuItem[] = [
  { label: "Photo", icon: <Camera /> },
  { label: "Gallery", icon: <ImageIcon /> },
  { label: "Note", icon: <FileText /> },
  { label: "Voice", icon: <Mic /> },
  { label: "Place", icon: <MapPin /> },
];

const PAD = 40;

export function BranchedMenu({
  items = defaultItems,
  radius = 130,
  spread = 150,
  color = "#a3e635",
  label = "Create",
  onSelect,
  className,
}: BranchedMenuProps) {
  const [open, setOpen] = useState(false);
  const trigger = useRef<HTMLButtonElement>(null);
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const menuId = useId();

  const w = radius * 2 + PAD * 2;
  const h = radius + PAD * 2;
  const ox = w / 2;
  const oy = h - PAD;
  const n = items.length;

  const nodes = items.map((item, i) => {
    const a = ((-90 - spread / 2 + (n > 1 ? (i * spread) / (n - 1) : spread / 2)) * Math.PI) / 180;
    const ex = ox + Math.cos(a) * radius;
    const ey = oy + Math.sin(a) * radius;
    // Grow straight up out of the trunk first, then bend out toward the leaf.
    const d = `M${ox} ${oy - 22}C${ox} ${oy - radius * 0.55} ${ex - (ex - ox) * 0.3} ${ey + (oy - ey) * 0.22} ${ex} ${ey}`;
    return { item, ex, ey, d };
  });

  useEffect(() => {
    if (open) refs.current[0]?.focus();
  }, [open]);

  const close = (refocus: boolean) => {
    setOpen(false);
    if (refocus) trigger.current?.focus();
  };

  const onMenuKey = (e: KeyboardEvent) => {
    const i = refs.current.findIndex((el) => el === document.activeElement);
    const move = (to: number) => {
      e.preventDefault();
      refs.current[(to + n) % n]?.focus();
    };
    if (e.key === "Escape") {
      e.preventDefault();
      close(true);
    } else if (e.key === "ArrowRight" || e.key === "ArrowDown") move(i + 1);
    else if (e.key === "ArrowLeft" || e.key === "ArrowUp") move(i - 1);
    else if (e.key === "Home") move(0);
    else if (e.key === "End") move(n - 1);
  };

  return (
    <MotionConfig reducedMotion="user">
      <div
        className={`relative ${className ?? ""}`}
        style={{ width: w, height: h }}
        onBlur={(e) => {
          if (open && !e.currentTarget.contains(e.relatedTarget as Node | null)) setOpen(false);
        }}
      >
        <svg aria-hidden width={w} height={h} className="pointer-events-none absolute inset-0 overflow-visible">
          <AnimatePresence>
            {open &&
              nodes.map(({ d }, i) => (
                <motion.path
                  key={i}
                  d={d}
                  fill="none"
                  stroke={color}
                  strokeWidth={2.5}
                  strokeLinecap="round"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 1, transition: { duration: 0.42, delay: i * 0.045, ease: [0.3, 0.7, 0.2, 1] } }}
                  exit={{ pathLength: 0, opacity: 0, transition: { duration: 0.3, delay: 0.12 + (n - 1 - i) * 0.03, ease: "easeIn" } }}
                  style={{ filter: `drop-shadow(0 0 6px ${color}66)` }}
                />
              ))}
          </AnimatePresence>
        </svg>

        <AnimatePresence>
          {open && (
            <motion.div id={menuId} role="menu" aria-label={label} onKeyDown={onMenuKey} exit={{ opacity: 1 }}>
              {nodes.map(({ item, ex, ey }, i) => (
                <motion.div
                  key={item.label + i}
                  className="absolute -translate-x-1/2 -translate-y-1/2"
                  style={{ left: ex, top: ey }}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1, transition: { type: "spring", stiffness: 460, damping: 17, delay: 0.24 + i * 0.045 } }}
                  exit={{ scale: 0, opacity: 0, transition: { duration: 0.16, delay: (n - 1 - i) * 0.02, ease: "easeIn" } }}
                >
                  <button
                    ref={(el) => {
                      refs.current[i] = el;
                    }}
                    type="button"
                    role="menuitem"
                    tabIndex={-1}
                    onClick={() => {
                      onSelect?.(item, i);
                      close(true);
                    }}
                    className="group/item peer grid size-11 place-items-center rounded-full border border-border bg-card text-foreground shadow-lg outline-none transition-[scale,box-shadow,background-color] duration-200 hover:scale-110 focus-visible:scale-110 focus-visible:ring-[3px] focus-visible:ring-ring/60 active:scale-95 [&_svg]:size-5"
                    style={{ boxShadow: `0 0 0 1px ${color}40, 0 8px 20px -8px ${color}` }}
                  >
                    {item.icon}
                    <span className="sr-only">{item.label}</span>
                  </button>
                  <span
                    aria-hidden
                    className="pointer-events-none absolute left-1/2 top-full mt-1.5 -translate-x-1/2 whitespace-nowrap rounded-md bg-foreground px-1.5 py-0.5 text-[11px] font-medium text-background opacity-0 transition-opacity duration-150 peer-hover:opacity-100 peer-focus-visible:opacity-100"
                  >
                    {item.label}
                  </span>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        <motion.button
          ref={trigger}
          type="button"
          aria-haspopup="menu"
          aria-expanded={open}
          aria-controls={open ? menuId : undefined}
          aria-label={label}
          onClick={() => setOpen((o) => !o)}
          onKeyDown={(e) => {
            if (e.key === "Escape" && open) close(true);
          }}
          whileTap={{ scaleX: 1.14, scaleY: 0.86 }}
          animate={{ scale: open ? 0.92 : 1 }}
          transition={{ type: "spring", stiffness: 500, damping: 18 }}
          className="absolute grid size-12 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-primary text-primary-foreground shadow-[inset_0_1px_0_rgb(255_255_255/.35),0_10px_28px_-10px_var(--primary)] outline-none focus-visible:ring-[3px] focus-visible:ring-ring/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          style={{ left: ox, top: oy }}
        >
          <motion.span
            aria-hidden
            className="grid place-items-center"
            animate={{ rotate: open ? 135 : 0 }}
            transition={{ type: "spring", stiffness: 380, damping: 16 }}
          >
            <Plus className="size-6" strokeWidth={2.5} />
          </motion.span>
        </motion.button>
      </div>
    </MotionConfig>
  );
}
