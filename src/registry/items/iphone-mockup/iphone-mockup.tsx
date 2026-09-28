"use client";
/* eslint-disable @next/next/no-img-element */

import { type PointerEvent, type ReactNode } from "react";
import { motion, useMotionTemplate, useMotionValue, useReducedMotion, useSpring, useTransform } from "motion/react";
import { cn } from "@/lib/utils";

export type IphoneColor = "natural" | "black" | "white" | "blue" | "desert";

export interface IphoneMockupProps {
  /** Screen image. Ignored when children are given. */
  src?: string;
  alt?: string;
  /** Anything to render as the screen (390 x 844 aspect). */
  children?: ReactNode;
  /** Titanium finish. */
  color?: IphoneColor;
  /** Rendered width in px; everything scales with it. */
  width?: number;
  /** Tilt toward the pointer in 3D. */
  tilt?: boolean;
  /** Max tilt angle in degrees. */
  tiltAmount?: number;
  /** Diagonal glass reflection over the screen. */
  glare?: boolean;
  /** Status bar text color, or hide it. */
  statusBar?: "light" | "dark" | "none";
  /** Time shown in the status bar. */
  time?: string;
  className?: string;
}

// [edge highlight, body, shadow side]
const FINISH: Record<IphoneColor, [string, string, string]> = {
  natural: ["#d9d4cb", "#a9a49b", "#6f6b64"],
  black: ["#5a5a5e", "#2e2e31", "#141416"],
  white: ["#f4f2ee", "#d6d3cd", "#a19e98"],
  blue: ["#6b7a8f", "#3c4859", "#1f2631"],
  desert: ["#e2cbb3", "#b99c80", "#7d654f"],
};

// 1em = 1% of the phone's width, so every measurement below scales together.
const H = 100 / 0.4884; // real 15 Pro outline ratio

function StatusBar({ tone, time }: { tone: "light" | "dark"; time: string }) {
  const c = tone === "light" ? "#fff" : "#000";
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-x-0 top-0 z-20 flex items-center justify-between font-semibold"
      style={{ height: "13em", padding: "0 8.5em 0 11em", color: c, fontSize: "1em" }}
    >
      <span style={{ fontSize: "4.6em", letterSpacing: "-0.01em" }}>{time}</span>
      <span className="flex items-center" style={{ gap: "1.6em" }}>
        {/* signal */}
        <svg viewBox="0 0 18 12" style={{ width: "5.6em" }} fill={c}>
          <rect x="0" y="8" width="3" height="4" rx="0.8" />
          <rect x="5" y="5.5" width="3" height="6.5" rx="0.8" />
          <rect x="10" y="3" width="3" height="9" rx="0.8" />
          <rect x="15" y="0" width="3" height="12" rx="0.8" />
        </svg>
        {/* wifi */}
        <svg viewBox="0 0 16 12" style={{ width: "5em" }} fill={c}>
          <path d="M8 2.2c2.4 0 4.6.9 6.2 2.5l1.3-1.4A10.6 10.6 0 0 0 8 .3 10.6 10.6 0 0 0 .5 3.3l1.3 1.4A8.7 8.7 0 0 1 8 2.2Zm0 3.7c1.4 0 2.7.5 3.6 1.4L13 6a7 7 0 0 0-10 0l1.4 1.3c.9-.9 2.2-1.4 3.6-1.4Zm0 3.7c-.5 0-1 .2-1.3.5L8 11.7l1.3-1.6c-.3-.3-.8-.5-1.3-.5Z" />
        </svg>
        {/* battery */}
        <svg viewBox="0 0 27 13" style={{ width: "8.4em" }}>
          <rect x="0.5" y="0.5" width="23" height="12" rx="3.8" fill="none" stroke={c} strokeOpacity="0.4" />
          <rect x="2" y="2" width="17" height="9" rx="2.4" fill={c} />
          <path d="M25 4.5v4c.8-.3 1.3-1.1 1.3-2s-.5-1.7-1.3-2Z" fill={c} fillOpacity="0.45" />
        </svg>
      </span>
    </div>
  );
}

export function IphoneMockup({
  src,
  alt = "",
  children,
  color = "natural",
  width = 300,
  tilt = true,
  tiltAmount = 14,
  glare = true,
  statusBar = "light",
  time = "9:41",
  className,
}: IphoneMockupProps) {
  const reduce = useReducedMotion();
  const [hi, body, lo] = FINISH[color] ?? FINISH.natural;
  const px = useMotionValue(0.5);
  const py = useMotionValue(0.5);
  const spring = { stiffness: 160, damping: 18, mass: 0.6 };
  const rx = useSpring(useTransform(py, [0, 1], [tiltAmount, -tiltAmount]), spring);
  const ry = useSpring(useTransform(px, [0, 1], [-tiltAmount, tiltAmount]), spring);
  const glareX = useSpring(useTransform(px, [0, 1], [-30, 30]), spring);
  const glareBg = useMotionTemplate`linear-gradient(118deg, transparent calc(18% + ${glareX}%), rgba(255,255,255,.16) calc(30% + ${glareX}%), rgba(255,255,255,.05) calc(44% + ${glareX}%), transparent calc(45% + ${glareX}%))`;
  const canTilt = tilt && !reduce;

  const onMove = (e: PointerEvent<HTMLDivElement>) => {
    if (!canTilt) return;
    const r = e.currentTarget.getBoundingClientRect();
    px.set((e.clientX - r.left) / r.width);
    py.set((e.clientY - r.top) / r.height);
  };
  const onLeave = () => {
    px.set(0.5);
    py.set(0.5);
  };

  const metal = `linear-gradient(135deg, ${hi} 0%, ${body} 18%, ${lo} 50%, ${body} 82%, ${hi} 100%)`;
  const button = (side: "left" | "right", top: number, h: number) => (
    <span
      aria-hidden
      className="absolute"
      style={{
        [side]: "-0.9em",
        top: `${top}em`,
        width: "1.4em",
        height: `${h}em`,
        borderRadius: side === "left" ? "0.8em 0 0 0.8em" : "0 0.8em 0.8em 0",
        background: `linear-gradient(${side === "left" ? 90 : 270}deg, ${lo}, ${hi} 55%, ${body})`,
        boxShadow: "inset 0 0.2em 0.2em rgba(255,255,255,.25), inset 0 -0.2em 0.2em rgba(0,0,0,.3)",
      }}
    />
  );

  return (
    <div
      className={cn("relative shrink-0 select-none", className)}
      style={{ width, fontSize: width / 100, perspective: `${width * 4}px` }}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
    >
      <motion.div
        className="relative"
        style={{ width: "100em", height: `${H}em`, rotateX: canTilt ? rx : 0, rotateY: canTilt ? ry : 0, transformStyle: "preserve-3d" }}
      >
        {/* ground shadow */}
        <div
          aria-hidden
          className="absolute rounded-[50%] bg-black/50 blur-2xl"
          style={{ left: "10em", right: "10em", bottom: "-7em", height: "10em", transform: "translateZ(-40px)" }}
        />
        {button("left", 36, 7)}
        {button("left", 52, 13)}
        {button("left", 69, 13)}
        {button("right", 56, 21)}

        {/* titanium band */}
        <div
          className="absolute inset-0"
          style={{
            borderRadius: "17em",
            background: metal,
            padding: "1.25em",
            boxShadow: `0 3em 6em -1em rgba(0,0,0,.55), inset 0 0 0 0.3em ${hi}55, inset 0 0 0.8em 0.35em rgba(0,0,0,.35)`,
          }}
        >
          {/* black glass bezel */}
          <div
            className="relative size-full bg-black"
            style={{ borderRadius: "15.8em", padding: "3.2em", boxShadow: "inset 0 0 0 0.25em #1a1a1a" }}
          >
            {/* screen */}
            <div className="relative size-full overflow-hidden bg-neutral-900" style={{ borderRadius: "12.6em", fontSize: "1em" }}>
              <div className="absolute inset-0 overflow-hidden" style={{ fontSize: 16 }}>
                {children ?? (src ? <img src={src} alt={alt} draggable={false} className="size-full object-cover" /> : null)}
              </div>

              {statusBar !== "none" && <StatusBar tone={statusBar} time={time} />}

              {/* dynamic island */}
              <div
                aria-hidden
                className="absolute left-1/2 z-30 -translate-x-1/2 bg-black"
                style={{ top: "2.9em", width: "30em", height: "8.8em", borderRadius: "999px" }}
              >
                <span
                  className="absolute rounded-full"
                  style={{
                    right: "3em",
                    top: "2.6em",
                    width: "3.6em",
                    height: "3.6em",
                    background: "radial-gradient(circle at 35% 35%, #2b3a5c 0 22%, #0c1220 45%, #050608 70%)",
                  }}
                />
              </div>

              {/* home indicator */}
              <div
                aria-hidden
                className="absolute left-1/2 z-20 -translate-x-1/2 rounded-full"
                style={{
                  bottom: "2.2em",
                  width: "36em",
                  height: "1.4em",
                  background: statusBar === "dark" ? "rgba(0,0,0,.85)" : "rgba(255,255,255,.9)",
                }}
              />

              {glare && (
                <motion.div
                  aria-hidden
                  className="pointer-events-none absolute inset-0 z-40"
                  style={{ background: canTilt ? glareBg : "linear-gradient(118deg, transparent 18%, rgba(255,255,255,.16) 30%, rgba(255,255,255,.05) 44%, transparent 45%)" }}
                />
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
