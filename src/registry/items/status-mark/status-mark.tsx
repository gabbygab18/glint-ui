"use client";

import { MotionConfig, motion } from "motion/react";

export type StatusMarkStatus = "idle" | "loading" | "success" | "error";

export interface StatusMarkProps {
  status?: StatusMarkStatus;
  /** Diameter in px. */
  size?: number;
  successColor?: string;
  errorColor?: string;
  /** Screen-reader text per status. */
  labels?: Partial<Record<StatusMarkStatus, string>>;
  className?: string;
}

const draw = (on: boolean, delay = 0) => ({
  animate: { pathLength: on ? 1 : 0, opacity: on ? 1 : 0 },
  transition: on
    ? { pathLength: { type: "spring", stiffness: 260, damping: 18, delay }, opacity: { duration: 0.01, delay } }
    : { duration: 0.12 },
});

export function StatusMark({
  status = "idle",
  size = 48,
  successColor = "#22c55e",
  errorColor = "#ef4444",
  labels,
  className,
}: StatusMarkProps) {
  const loading = status === "loading";
  const ok = status === "success";
  const bad = status === "error";
  const tint = ok ? successColor : bad ? errorColor : "var(--muted-foreground)";
  const text = { idle: "Idle", loading: "Loading", success: "Done", error: "Failed", ...labels }[status];

  return (
    <MotionConfig reducedMotion="user">
      <span
        role="status"
        className={`relative inline-grid place-items-center transition-colors duration-300 ${className ?? ""}`}
        style={{ width: size, height: size, color: tint }}
      >
        <motion.svg
          aria-hidden
          viewBox="0 0 48 48"
          fill="none"
          className="size-full overflow-visible"
          initial={false}
          animate={
            ok ? { scale: [1, 0.86, 1.14, 1], x: 0 } : bad ? { x: [0, -5, 5, -4, 3, -1, 0], scale: 1 } : { scale: 1, x: 0 }
          }
          transition={{ duration: ok ? 0.5 : 0.45, ease: "easeOut", delay: ok || bad ? 0.15 : 0 }}
        >
          {/* Soft disc that floods in on a result. */}
          <motion.circle
            cx="24"
            cy="24"
            r="20"
            initial={false}
            animate={{ scale: ok || bad ? 1 : 0.4, opacity: ok || bad ? 0.16 : 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 18, delay: 0.1 }}
            fill="currentColor"
          />
          {/* Ring: a spinning arc while loading that grows closed when it resolves. */}
          <motion.g
            initial={false}
            animate={{ rotate: loading ? [0, 360] : 0 }}
            transition={loading ? { duration: 0.9, ease: "linear", repeat: Infinity } : { duration: 0.3 }}
          >
            <circle cx="24" cy="24" r="20" strokeWidth="3" className="stroke-border" opacity={loading ? 1 : 0} />
            <motion.circle
              cx="24"
              cy="24"
              r="20"
              strokeWidth="3"
              strokeLinecap="round"
              transform="rotate(-90 24 24)"
              initial={false}
              animate={{ pathLength: loading ? 0.28 : 1, opacity: status === "idle" ? 0.45 : 1 }}
              transition={{ type: "spring", stiffness: 180, damping: 20 }}
              stroke="currentColor"
            />
          </motion.g>
          {/* Idle dot. */}
          <motion.circle
            cx="24"
            cy="24"
            r="4"
            initial={false}
            animate={{ scale: status === "idle" ? 1 : 0 }}
            transition={{ type: "spring", stiffness: 500, damping: 20 }}
            className="fill-muted-foreground"
          />
          <motion.path d="M15 24.5l6 6L33 18" stroke={successColor} strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" initial={false} {...draw(ok, 0.2)} />
          <motion.path d="M17 17l14 14" stroke={errorColor} strokeWidth="3.5" strokeLinecap="round" initial={false} {...draw(bad, 0.15)} />
          <motion.path d="M31 17L17 31" stroke={errorColor} strokeWidth="3.5" strokeLinecap="round" initial={false} {...draw(bad, 0.28)} />
        </motion.svg>
        <span className="sr-only">{text}</span>
      </span>
    </MotionConfig>
  );
}
