"use client";

import { useRef, useState, type MouseEvent } from "react";
import { animate, motion, useMotionValue, useReducedMotion, useTransform, type PanInfo } from "motion/react";
import { Check } from "lucide-react";

export interface TearTicketProps {
  title?: string;
  subtitle?: string;
  date?: string;
  time?: string;
  seat?: string;
  /** Stamped on the ticket once the stub is gone. */
  confirmation?: string;
  accent?: string;
  /** Px the stub must be pulled before it tears on release. */
  threshold?: number;
  onTear?: () => void;
  className?: string;
}

// Two half-height tiles, each with one round bite, give a ticket its notches.
const notch = (side: "0" | "100%") =>
  `radial-gradient(circle 11px at ${side} 0, #0000 97%, #000) top / 100% 51% no-repeat, radial-gradient(circle 11px at ${side} 100%, #0000 97%, #000) bottom / 100% 51% no-repeat`;

const rubber = (d: number, limit: number) => (1 - 1 / ((d * 0.6) / limit + 1)) * limit;

export function TearTicket({
  title = "Neon Nights",
  subtitle = "Warehouse 9 · Live set",
  date = "Sat 14 Jun",
  time = "21:00",
  seat = "GA 042",
  confirmation = "You're in!",
  accent = "#fbbf24",
  threshold = 90,
  onTear,
  className,
}: TearTicketProps) {
  const reduce = useReducedMotion();
  const [torn, setTorn] = useState(false);
  const moved = useRef(false);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const spin = useMotionValue(0);
  const fade = useMotionValue(1);
  const recoil = useMotionValue(0);
  // Hinged at the bottom corner: the harder you pull, the more the top peels away.
  const pull = useRef(0);
  const limit = threshold * 2;
  const atThreshold = rubber(threshold, limit);
  // 0..1: how close the pull is to tearing.
  const strain = useTransform(() => Math.min(Math.hypot(x.get(), y.get()) / atThreshold, 1.2));
  const rotate = useTransform(() => strain.get() * 9 + spin.get());
  const lean = useTransform(() => x.get() * 0.06 + recoil.get());
  const seam = useTransform(strain, [0, 1], ["rgba(0,0,0,0.3)", "rgba(0,0,0,0.85)"]);

  const tear = () => {
    if (torn) return;
    setTorn(true);
    onTear?.();
    if (reduce) return fade.set(0);
    const fall = { duration: 0.75, ease: [0.45, 0, 0.9, 0.6] as const };
    animate(y, y.get() + 340, fall);
    animate(x, x.get() + 90, { duration: 0.75, ease: "easeOut" });
    animate(spin, 38, fall);
    animate(fade, 0, { duration: 0.3, delay: 0.45 });
    animate(recoil, [0, -9, 4, 0], { duration: 0.5, ease: "easeOut" });
  };

  const onPan = (_: unknown, info: PanInfo) => {
    if (torn) return;
    moved.current = true; // swallow the click that ends a drag
    const { x: ox, y: oy } = info.offset;
    const d = Math.hypot(ox, oy) || 1;
    pull.current = d;
    const k = rubber(d, limit) / d;
    x.set(ox * k);
    y.set(oy * k);
  };

  const onPanEnd = () => {
    if (torn) return;
    if (pull.current >= threshold) return tear();
    const back = reduce ? { duration: 0 } : ({ type: "spring", stiffness: 600, damping: 14 } as const);
    animate(x, 0, back);
    animate(y, 0, back);
  };

  const onClick = (e: MouseEvent<HTMLButtonElement>) => {
    if (moved.current) return;
    if (e.detail === 0) return tear(); // keyboard: Enter / Space
    if (!reduce) animate(x, [0, 16, -5, 0], { duration: 0.45 }); // a tug that hints "drag me"
  };

  return (
    <div className={`relative flex h-36 w-[22rem] max-w-full select-none ${className ?? ""}`}>
      <motion.div className="relative min-w-0 flex-1 drop-shadow-xl" style={{ x: lean }}>
        <div className="flex h-full flex-col justify-between bg-card p-5" style={{ mask: notch("100%") }}>
          <motion.div animate={{ opacity: torn ? 0.25 : 1 }} transition={{ duration: 0.3 }}>
            <p className="text-[10px] font-semibold tracking-[0.2em] uppercase" style={{ color: accent }}>
              Admit one
            </p>
            <p className="mt-1 text-xl font-bold tracking-tight text-foreground">{title}</p>
            <p className="text-xs text-muted-foreground">{subtitle}</p>
          </motion.div>
          <motion.dl
            className="flex gap-5 text-xs"
            animate={{ opacity: torn ? 0.25 : 1 }}
            transition={{ duration: 0.3 }}
          >
            {[
              ["Date", date],
              ["Doors", time],
              ["Seat", seat],
            ].map(([k, v]) => (
              <div key={k}>
                <dt className="text-muted-foreground">{k}</dt>
                <dd className="font-medium text-foreground">{v}</dd>
              </div>
            ))}
          </motion.dl>
        </div>
        <div role="status" className="pointer-events-none absolute inset-0 grid place-items-center">
          {torn && (
            <motion.div
              initial={reduce ? false : { scale: 2.4, opacity: 0, rotate: -24 }}
              animate={{ scale: 1, opacity: 1, rotate: -8 }}
              transition={{ type: "spring", stiffness: 520, damping: 14, delay: 0.15 }}
              className="flex items-center gap-2 rounded-lg border-[3px] px-4 py-2 text-lg font-black tracking-wide uppercase"
              style={{ borderColor: accent, color: accent }}
            >
              <Check className="size-5" strokeWidth={3.5} />
              {confirmation}
            </motion.div>
          )}
        </div>
      </motion.div>

      <motion.div
        className="relative w-24 shrink-0 rounded-md drop-shadow-xl has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-4 has-[:focus-visible]:outline-ring" style={{ x, y, rotate, opacity: fade, transformOrigin: "0% 100%" }}>
        <motion.button
          type="button"
          disabled={torn}
          aria-label={`Tear off the stub to check in (${seat})`}
          onPointerDown={() => {
            moved.current = false;
            pull.current = 0;
          }}
          onPan={onPan}
          onPanEnd={onPanEnd}
          onClick={onClick}
          style={{ mask: notch("0"), background: accent, touchAction: "none" }}
          className="flex size-full cursor-grab flex-col items-center justify-between py-4 text-black/80 outline-none active:cursor-grabbing"
        >
          <span className="text-[10px] font-bold tracking-[0.2em] uppercase">Stub</span>
          <span className="text-sm font-black [writing-mode:vertical-rl]">{seat}</span>
          <span aria-hidden className="h-5 w-14 bg-[repeating-linear-gradient(90deg,currentColor_0_2px,transparent_2px_4px,currentColor_4px_5px,transparent_5px_8px)] opacity-70" />
        </motion.button>
        {/* Perforation: darkens as the tear strains. */}
        <motion.span
          aria-hidden
          className="pointer-events-none absolute inset-y-3 left-0 border-l-2 border-dashed"
          style={{ borderColor: seam }}
        />
      </motion.div>
    </div>
  );
}
