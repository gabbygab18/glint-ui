"use client";

import { useState } from "react";
import { MotionConfig, motion } from "motion/react";

export interface FolderFloatProps {
  /** Folder name, shown under the icon. */
  label?: string;
  /** File names that float out (the first four are drawn). */
  files?: string[];
  /** Folder color. */
  color?: string;
  /** Controlled pinned-open state. */
  open?: boolean;
  /** Initial pinned state when uncontrolled. */
  defaultOpen?: boolean;
  /** Called when a click or Enter pins / unpins the folder open. */
  onOpenChange?: (open: boolean) => void;
  className?: string;
}

const float = { type: "spring", stiffness: 260, damping: 15, mass: 0.9 } as const;
const tints = ["#f472b6", "#34d399", "#fbbf24", "#60a5fa"];

export function FolderFloat({
  label = "Design",
  files = ["brief.pdf", "moodboard.png", "logo.svg", "notes.md"],
  color = "#60a5fa",
  open,
  defaultOpen = false,
  onOpenChange,
  className,
}: FolderFloatProps) {
  const [inner, setInner] = useState(defaultOpen);
  const [peek, setPeek] = useState(false);
  const pinned = open ?? inner;
  const out = pinned || peek;
  const shown = files.slice(0, 4);
  const mid = (shown.length - 1) / 2;

  return (
    <MotionConfig reducedMotion="user">
      <button
        type="button"
        aria-expanded={pinned}
        aria-label={`${label} folder, ${files.length} ${files.length === 1 ? "file" : "files"}`}
        onClick={() => {
          setInner(!pinned);
          onOpenChange?.(!pinned);
        }}
        onPointerEnter={(e) => e.pointerType === "mouse" && setPeek(true)}
        onPointerLeave={() => setPeek(false)}
        onFocus={(e) => e.currentTarget.matches(":focus-visible") && setPeek(true)}
        onBlur={() => setPeek(false)}
        className={`group grid select-none justify-items-center gap-3 rounded-2xl px-6 pb-4 pt-24 outline-none focus-visible:ring-[3px] focus-visible:ring-ring/60 ${className ?? ""}`}
      >
        <motion.span
          aria-hidden
          className="relative block h-32 w-44 [perspective:600px]"
          initial={false}
          animate={{ scaleY: out ? [1, 0.93, 1.03, 1] : [1, 1.03, 0.98, 1], scaleX: out ? [1, 1.05, 0.98, 1] : [1, 0.98, 1.01, 1] }}
          transition={{ duration: 0.45, ease: "easeOut" }}
          style={{ transformOrigin: "50% 100%" }}
        >
          {/* back panel + tab */}
          <span
            className="absolute left-0 top-0 h-6 w-16 rounded-t-lg"
            style={{ background: `color-mix(in oklab, ${color} 62%, black)` }}
          />
          <span
            className="absolute inset-x-0 bottom-0 top-4 rounded-xl rounded-tl-none"
            style={{ background: `color-mix(in oklab, ${color} 62%, black)` }}
          />

          {shown.map((name, i) => {
            const k = i - mid;
            return (
              <motion.span
                key={name + i}
                className="absolute bottom-4 left-1/2 -ml-11 flex h-28 w-22 flex-col gap-1.5 rounded-lg border border-black/10 bg-[#fafaf9] p-2.5 text-left shadow-[0_8px_20px_-8px_rgb(0_0_0/.6)]"
                initial={false}
                animate={
                  out
                    ? { x: k * 46, y: -78 - (mid - Math.abs(k)) * 12, rotate: k * 11, scale: 1 }
                    : { x: k * 7, y: 0, rotate: k * 3, scale: 0.96 }
                }
                transition={{ ...float, delay: out ? 0.05 + i * 0.05 : (shown.length - 1 - i) * 0.03 }}
              >
                <span className="h-5 w-5 rounded" style={{ background: tints[i % tints.length] }} />
                <span className="h-1 w-full rounded-full bg-black/10" />
                <span className="h-1 w-3/4 rounded-full bg-black/10" />
                <span className="mt-auto truncate text-[10px] font-medium text-zinc-500">{name}</span>
              </motion.span>
            );
          })}

          {/* front flap tips forward so the files can climb out */}
          <motion.span
            className="absolute inset-x-0 bottom-0 h-24 rounded-xl"
            initial={false}
            animate={{ rotateX: out ? -34 : 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 16 }}
            style={{
              transformOrigin: "50% 100%",
              background: `linear-gradient(180deg, color-mix(in oklab, ${color} 92%, white), ${color})`,
              boxShadow: `inset 0 1px 0 rgb(255 255 255/.45), 0 -6px 18px -10px rgb(0 0 0/.5)`,
            }}
          >
            <span className="absolute bottom-3 left-4 h-1.5 w-10 rounded-full bg-white/40" />
          </motion.span>

          <motion.span
            className="absolute -right-2 -top-1 z-10 grid h-7 min-w-7 place-items-center rounded-full border-2 border-background px-1.5 text-xs font-bold tabular-nums text-white"
            initial={false}
            animate={{ scale: out ? 1.15 : 1, y: out ? -4 : 0, rotate: out ? 8 : 0 }}
            transition={{ type: "spring", stiffness: 600, damping: 12 }}
            style={{ background: `color-mix(in oklab, ${color} 55%, black)` }}
          >
            {files.length}
          </motion.span>
        </motion.span>

        <span aria-hidden className="grid text-center leading-tight">
          <span className="text-sm font-semibold text-foreground">{label}</span>
          <span className="text-xs text-muted-foreground">
            {files.length} {files.length === 1 ? "file" : "files"}
            {pinned ? " · open" : ""}
          </span>
        </span>
      </button>
    </MotionConfig>
  );
}
