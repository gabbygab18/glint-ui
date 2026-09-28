"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, MotionConfig, motion } from "motion/react";
import { Phone, PhoneOff } from "lucide-react";

export interface CallChipProps {
  /** Caller name. */
  name?: string;
  /** Line under the name while ringing. */
  subtitle?: string;
  /** Optional avatar image URL; initials are used otherwise. */
  avatar?: string;
  /** Accept button and live-call accent color. */
  acceptColor?: string;
  /** Decline / hang-up color. */
  declineColor?: string;
  /** Ms after the call ends before the chip rings again. 0 keeps the ended state. */
  resetDelay?: number;
  onAccept?: () => void;
  onDecline?: () => void;
  /** Called with the call length in seconds when hung up. */
  onEnd?: (seconds: number) => void;
  className?: string;
}

type Phase = "ringing" | "open" | "live" | "ended" | "declined";

const css = `
@keyframes call-chip-ring{from{transform:scale(1);opacity:.55}to{transform:scale(1.7);opacity:0}}
@keyframes call-chip-wiggle{0%,55%,100%{transform:rotate(0)}60%,70%,80%,90%{transform:rotate(-16deg)}65%,75%,85%,95%{transform:rotate(16deg)}}
@keyframes call-chip-bar{0%,100%{transform:scaleY(.35)}50%{transform:scaleY(1)}}
@media (prefers-reduced-motion:reduce){.call-chip-anim{animation:none!important}}`;

const spring = { type: "spring", stiffness: 420, damping: 34 } as const;
const swap = {
  initial: { opacity: 0, scale: 0.9, filter: "blur(6px)" },
  animate: { opacity: 1, scale: 1, filter: "blur(0px)" },
  exit: { opacity: 0, scale: 0.9, filter: "blur(6px)" },
  transition: { duration: 0.22 },
};

const fmt = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

export function CallChip({
  name = "Maya Chen",
  subtitle = "Incoming call",
  avatar,
  acceptColor = "#22c55e",
  declineColor = "#ef4444",
  resetDelay = 2500,
  onAccept,
  onDecline,
  onEnd,
  className,
}: CallChipProps) {
  const [phase, setPhase] = useState<Phase>("ringing");
  const [secs, setSecs] = useState(0);
  const acceptRef = useRef<HTMLButtonElement>(null);
  const endRef = useRef<HTMLButtonElement>(null);
  const chipRef = useRef<HTMLButtonElement>(null);
  const hadFocus = useRef(false);

  useEffect(() => {
    if (phase !== "live") return;
    const id = window.setInterval(() => setSecs((s) => s + 1), 1000);
    return () => window.clearInterval(id);
  }, [phase]);

  useEffect(() => {
    if ((phase !== "ended" && phase !== "declined") || !resetDelay) return;
    const id = window.setTimeout(() => setPhase("ringing"), resetDelay);
    return () => window.clearTimeout(id);
  }, [phase, resetDelay]);

  // Keep keyboard focus inside the chip as it morphs between states.
  useEffect(() => {
    if (!hadFocus.current) return;
    if (phase === "open") acceptRef.current?.focus();
    if (phase === "live") endRef.current?.focus();
    if (phase === "ringing") chipRef.current?.focus();
  }, [phase]);

  const initials = name
    .split(/\s+/)
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const face = (size: number, rings: boolean) => (
    <span className="relative grid shrink-0 place-items-center" style={{ width: size, height: size }}>
      {rings &&
        [0, 0.7].map((d) => (
          <span
            key={d}
            aria-hidden
            className="call-chip-anim absolute inset-0 rounded-full"
            style={{ background: acceptColor, animation: `call-chip-ring 1.4s ${d}s cubic-bezier(.2,.6,.4,1) infinite` }}
          />
        ))}
      <span
        aria-hidden
        className="relative grid size-full place-items-center overflow-hidden rounded-full bg-gradient-to-br from-violet-400 to-fuchsia-600 font-semibold text-white"
        style={{ fontSize: size * 0.36 }}
      >
        {avatar ? <span className="size-full bg-cover bg-center" style={{ backgroundImage: `url(${avatar})` }} /> : initials}
      </span>
    </span>
  );

  const round = "grid size-11 place-items-center rounded-full text-white outline-none transition-[scale,filter] duration-150 hover:brightness-110 active:scale-90 focus-visible:ring-[3px] focus-visible:ring-ring/70 focus-visible:ring-offset-2 focus-visible:ring-offset-card";

  return (
    <MotionConfig reducedMotion="user">
      <style href="call-chip" precedence="default">
        {css}
      </style>
      <motion.div
        layout
        transition={spring}
        role="group"
        aria-label={`Call from ${name}`}
        onFocusCapture={() => (hadFocus.current = true)}
        onBlurCapture={(e) => {
          if (!e.currentTarget.contains(e.relatedTarget as Node | null)) hadFocus.current = false;
        }}
        className={`relative border border-border bg-card text-foreground shadow-[0_18px_50px_-18px_rgb(0_0_0/.7)] ${className ?? ""}`}
        style={{ borderRadius: phase === "open" ? 28 : 999 }}
      >
        <AnimatePresence mode="popLayout" initial={false}>
          {phase === "ringing" && (
            <motion.button
              key="ringing"
              ref={chipRef}
              type="button"
              aria-expanded={false}
              aria-label={`${subtitle} from ${name}. Show options`}
              onClick={() => setPhase("open")}
              {...swap}
              whileTap={{ scale: 0.96 }}
              className="flex items-center gap-3 rounded-full py-1.5 pl-1.5 pr-4 outline-none focus-visible:ring-[3px] focus-visible:ring-inset focus-visible:ring-ring/60"
            >
              {face(32, true)}
              <span className="text-sm font-medium">{name}</span>
              <Phone
                aria-hidden
                className="call-chip-anim size-4"
                style={{ color: acceptColor, animation: "call-chip-wiggle 1.6s ease-in-out infinite" }}
              />
            </motion.button>
          )}

          {phase === "open" && (
            <motion.div key="open" {...swap} className="flex w-[21rem] items-center gap-3 p-3">
              {face(48, true)}
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold">{name}</p>
                <p className="truncate text-xs text-muted-foreground">{subtitle}…</p>
              </div>
              <motion.button
                type="button"
                aria-label="Decline"
                onClick={() => {
                  setPhase("declined");
                  onDecline?.();
                }}
                initial={{ scale: 0, rotate: -90 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", stiffness: 500, damping: 16, delay: 0.06 }}
                className={round}
                style={{ background: declineColor }}
              >
                <PhoneOff className="size-5" />
              </motion.button>
              <motion.button
                ref={acceptRef}
                type="button"
                aria-label="Accept"
                onClick={() => {
                  setSecs(0);
                  setPhase("live");
                  onAccept?.();
                }}
                initial={{ scale: 0, rotate: 90 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", stiffness: 500, damping: 16, delay: 0.12 }}
                className={round}
                style={{ background: acceptColor, boxShadow: `0 0 0 0 ${acceptColor}` }}
              >
                <Phone className="call-chip-anim size-5" style={{ animation: "call-chip-wiggle 1.6s ease-in-out infinite" }} />
              </motion.button>
            </motion.div>
          )}

          {phase === "live" && (
            <motion.div key="live" {...swap} className="flex items-center gap-3 py-1.5 pl-1.5 pr-1.5">
              <span className="relative">
                {face(32, false)}
                <span
                  aria-hidden
                  className="absolute -bottom-0.5 -right-0.5 size-3 rounded-full border-2 border-card"
                  style={{ background: acceptColor }}
                />
              </span>
              <span className="grid leading-tight">
                <span className="text-sm font-medium">{name}</span>
                <span className="text-xs tabular-nums" style={{ color: acceptColor }} role="timer" aria-label={`Call time ${fmt(secs)}`}>
                  {fmt(secs)}
                </span>
              </span>
              <span aria-hidden className="ml-2 flex h-4 items-center gap-[3px]">
                {[0.9, 0.6, 1.1, 0.75].map((d, i) => (
                  <span
                    key={i}
                    className="call-chip-anim h-full w-[3px] origin-center rounded-full"
                    style={{ background: acceptColor, animation: `call-chip-bar ${d}s ${i * 0.12}s ease-in-out infinite` }}
                  />
                ))}
              </span>
              <motion.button
                ref={endRef}
                type="button"
                aria-label="Hang up"
                onClick={() => {
                  setPhase("ended");
                  onEnd?.(secs);
                }}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 500, damping: 16, delay: 0.1 }}
                className={`${round} ml-1 size-9`}
                style={{ background: declineColor }}
              >
                <PhoneOff className="size-4" />
              </motion.button>
            </motion.div>
          )}

          {(phase === "ended" || phase === "declined") && (
            <motion.div key="ended" {...swap} className="flex items-center gap-2 px-4 py-2.5 text-sm">
              <PhoneOff aria-hidden className="size-4" style={{ color: declineColor }} />
              <span>{phase === "ended" ? `Call ended · ${fmt(secs)}` : "Declined"}</span>
            </motion.div>
          )}
        </AnimatePresence>
        <span className="sr-only" aria-live="polite">
          {phase === "live" ? `Connected to ${name}` : phase === "ended" ? "Call ended" : phase === "declined" ? "Call declined" : ""}
        </span>
      </motion.div>
    </MotionConfig>
  );
}
