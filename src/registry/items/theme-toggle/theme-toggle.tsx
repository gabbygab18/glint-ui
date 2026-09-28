"use client";

import { useId, useState } from "react";
import { motion, useAnimate, useReducedMotion } from "motion/react";

export interface ThemeToggleProps {
  /** Controlled: true = dark. */
  checked?: boolean;
  defaultChecked?: boolean;
  onChange?: (dark: boolean) => void;
  /** Track height in px (width is double). */
  size?: number;
  label?: string;
  className?: string;
}

const css = `@keyframes theme-toggle-twinkle{0%,100%{opacity:1}50%{opacity:.35}}
.theme-toggle-star{animation:theme-toggle-twinkle 2.4s ease-in-out infinite}
@media (prefers-reduced-motion:reduce){.theme-toggle-star{animation:none}}`;

// Star resting spots as fractions of the track, left of the moon.
const stars = [
  { x: 0.12, y: 0.3, s: 0.22 },
  { x: 0.3, y: 0.62, s: 0.16 },
  { x: 0.42, y: 0.22, s: 0.13 },
  { x: 0.2, y: 0.76, s: 0.1 },
  { x: 0.5, y: 0.52, s: 0.1 },
];
const rays = Array.from({ length: 8 }, (_, i) => (i * Math.PI) / 4);

export function ThemeToggle({
  checked,
  defaultChecked = false,
  onChange,
  size = 32,
  label = "Dark mode",
  className,
}: ThemeToggleProps) {
  const reduce = useReducedMotion();
  const [inner, setInner] = useState(defaultChecked);
  const dark = checked ?? inner;
  const mask = `tt-${useId().replace(/[^\w-]/g, "")}`;

  const w = size * 2;
  const pad = size * 0.1;
  const knob = size - pad * 2;
  const spring = reduce ? { duration: 0 } : { type: "spring" as const, stiffness: 320, damping: 20 };
  const soft = reduce ? { duration: 0 } : { type: "spring" as const, stiffness: 200, damping: 22 };

  const [squish, animateSquish] = useAnimate();

  const toggle = () => {
    // Stretch along the travel, then settle round again.
    if (!reduce) animateSquish(squish.current, { scaleX: [1, 1.3, 1], scaleY: [1, 0.82, 1] }, { duration: 0.45 });
    setInner(!dark);
    onChange?.(!dark);
  };

  return (
    <button
      type="button"
      role="switch"
      aria-checked={dark}
      aria-label={label}
      onClick={toggle}
      className={`relative shrink-0 overflow-hidden rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background ${className ?? ""}`}
      style={{ width: w, height: size }}
    >
      <style href="theme-toggle" precedence="default">
        {css}
      </style>
      <span aria-hidden className="absolute inset-0 bg-[linear-gradient(135deg,#7dd3fc,#0ea5e9)]" />
      <motion.span
        aria-hidden
        className="absolute inset-0 bg-[linear-gradient(135deg,#0b1026,#312e81)]"
        initial={false}
        animate={{ opacity: dark ? 1 : 0 }}
        transition={{ duration: reduce ? 0 : 0.45 }}
      />
      <span aria-hidden className="absolute inset-0 rounded-full shadow-[inset_0_2px_6px_rgb(0_0_0/.35)]" />

      {/* Clouds drift away when night falls. */}
      {[
        { x: 0.62, y: 0.52, s: 0.42 },
        { x: 0.76, y: 0.28, s: 0.3 },
      ].map((c, i) => (
        <motion.span
          key={i}
          aria-hidden
          className="absolute rounded-full bg-white/90"
          style={{ left: c.x * w, top: c.y * size, width: c.s * size * 1.8, height: c.s * size }}
          initial={false}
          animate={dark ? { x: size * 0.8, opacity: 0 } : { x: 0, opacity: 1 }}
          transition={{ ...soft, delay: dark || reduce ? 0 : 0.15 + i * 0.06 }}
        />
      ))}

      {/* Stars burst out of the moon as it lands, then twinkle. */}
      {stars.map((s, i) => (
        <motion.svg
          key={i}
          aria-hidden
          viewBox="0 0 10 10"
          className="absolute"
          style={{ left: s.x * w, top: s.y * size, width: s.s * size, height: s.s * size, marginLeft: (-s.s * size) / 2, marginTop: (-s.s * size) / 2 }}
          initial={false}
          animate={dark ? { x: 0, y: 0, scale: 1, opacity: 1, rotate: 0 } : { x: w * 0.7 - s.x * w, y: size / 2 - s.y * size, scale: 0, opacity: 0, rotate: -90 }}
          transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 260, damping: 14, delay: dark ? 0.18 + i * 0.05 : 0 }}
        >
          <path
            className="theme-toggle-star"
            style={{ animationDelay: `${i * 0.37}s` }}
            fill="#fef9c3"
            d="M5 0 6.1 3.9 10 5 6.1 6.1 5 10 3.9 6.1 0 5 3.9 3.9Z"
          />
        </motion.svg>
      ))}

      <motion.span
        aria-hidden
        className="absolute rounded-full"
        style={{ top: pad, left: pad, width: knob, height: knob }}
        initial={false}
        animate={{
          x: dark ? w - knob - pad * 2 : 0,
          boxShadow: dark ? "0 0 10px 1px rgb(226 232 240 / .35)" : "0 0 14px 3px rgb(253 224 71 / .7)",
        }}
        transition={{ x: spring, boxShadow: { duration: 0.4 } }}
      >
        <span ref={squish} className="block size-full">
        <motion.svg
          viewBox="0 0 24 24"
          className="size-full overflow-visible"
          initial={false}
          animate={{ rotate: dark ? 360 : 0 }}
          transition={spring}
        >
          <defs>
            <mask id={mask}>
              <rect x="-6" y="-6" width="36" height="36" fill="white" />
              {/* The bite that carves the crescent. */}
              <motion.circle
                r="9"
                fill="black"
                initial={false}
                animate={dark ? { cx: 18.5, cy: 6.5 } : { cx: 34, cy: -10 }}
                transition={soft}
              />
            </mask>
          </defs>
          <motion.g initial={false} animate={{ scale: dark ? 0 : 1, rotate: dark ? -90 : 0, opacity: dark ? 0 : 1 }} transition={soft}>
            {rays.map((a) => (
              <line
                key={a}
                x1={12 + Math.cos(a) * 8.6}
                y1={12 + Math.sin(a) * 8.6}
                x2={12 + Math.cos(a) * 11}
                y2={12 + Math.sin(a) * 11}
                stroke="#fde047"
                strokeWidth="2"
                strokeLinecap="round"
              />
            ))}
          </motion.g>
          <motion.circle
            cx="12"
            cy="12"
            mask={`url(#${mask})`}
            initial={false}
            animate={{ r: dark ? 10 : 6.2, fill: dark ? "#e2e8f0" : "#fde047" }}
            transition={soft}
          />
          <motion.g initial={false} animate={{ opacity: dark ? 1 : 0 }} transition={{ duration: reduce ? 0 : 0.3, delay: dark ? 0.2 : 0 }}>
            <circle cx="8" cy="14" r="1.8" fill="#cbd5e1" />
            <circle cx="12" cy="18.5" r="1.1" fill="#cbd5e1" />
          </motion.g>
        </motion.svg>
        </span>
      </motion.span>
    </button>
  );
}
