"use client";

import { useEffect, useRef, useState, type CSSProperties, type KeyboardEvent, type PointerEvent } from "react";

export interface GlintBotProps {
  /** Overall size in px. */
  size?: number;
  /** Head color. */
  color?: string;
  /** Stripe color around the top of the head. */
  accent?: string;
  /** Screen (face) color. */
  screen?: string;
  /** Eyes and mouth color. */
  ink?: string;
  /** Turn the head toward the pointer. */
  followCursor?: boolean;
  /** Blink, react to clicks, blush when petted, get dizzy when poked. */
  interactive?: boolean;
  label?: string;
  className?: string;
}

type Mood = "idle" | "happy" | "love" | "dizzy";

// Face normals in CSS space (x right, y down, z toward the viewer).
const FACES = [
  { key: "front", n: [0, 0, 1], t: "" },
  { key: "back", n: [0, 0, -1], t: "rotateY(180deg)" },
  { key: "right", n: [1, 0, 0], t: "rotateY(90deg)" },
  { key: "left", n: [-1, 0, 0], t: "rotateY(-90deg)" },
  { key: "top", n: [0, -1, 0], t: "rotateX(90deg)" },
  { key: "bottom", n: [0, 1, 0], t: "rotateX(-90deg)" },
] as const;

// Key light from the upper left, slightly in front.
const L = (() => {
  const v = [-0.45, -0.75, 0.55];
  const m = Math.hypot(...v);
  return v.map((x) => x / m);
})();

const NOISE =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")";

const css = `
@keyframes glint-bot-float{0%,100%{transform:translateY(0)}50%{transform:translateY(-4%)}}
@keyframes glint-bot-wobble{0%,100%{transform:rotate(0)}25%{transform:rotate(-7deg)}75%{transform:rotate(7deg)}}
`;

export function GlintBot({
  size = 280,
  color = "#b5e61d",
  accent = "#f4b860",
  screen = "#f4efdf",
  ink = "#1c2410",
  followCursor = true,
  interactive = true,
  label = "Glint Bot",
  className,
}: GlintBotProps) {
  const rootRef = useRef<HTMLButtonElement>(null);
  const squashRef = useRef<HTMLDivElement>(null);
  const headRef = useRef<HTMLDivElement>(null);
  const shadeRefs = useRef<(HTMLDivElement | null)[]>([]);
  const shineRef = useRef<HTMLDivElement>(null);
  const eyesRef = useRef<SVGGElement>(null);
  const [mood, setMood] = useState<Mood>("idle");
  const [blink, setBlink] = useState(false);
  const moodTimer = useRef<number | undefined>(undefined);
  const taps = useRef<number[]>([]);
  const pat = useRef<{ x: number; dir: number; turns: number; t0: number } | null>(null);

  const s = size * 0.5; // cube edge

  // Head follows the pointer; lighting is recomputed from the rotated face normals.
  useEffect(() => {
    const root = rootRef.current!;
    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    // Resting 3/4 pose shows the top and one side, so it reads as 3D before the pointer moves.
    const BASE = { x: -18, y: -10 };
    const target = { ...BASE };
    const cur = { ...BASE };
    let raf = 0;
    let lastMove = 0;
    let idleTimer = 0;

    const apply = () => {
      // A frame can still fire after unmount or a remount; bail out if the head is gone.
      const head = headRef.current;
      if (!head) return;
      const ry = (cur.x * Math.PI) / 180;
      const rx = (cur.y * Math.PI) / 180;
      head.style.transform = `rotateX(${cur.y}deg) rotateY(${cur.x}deg)`;
      const [cy, sy, cx, sx] = [Math.cos(ry), Math.sin(ry), Math.cos(rx), Math.sin(rx)];
      FACES.forEach((f, i) => {
        const [x, y, z] = f.n;
        // n' = Rx(rx) * Ry(ry) * n
        const x1 = x * cy + z * sy;
        const z1 = -x * sy + z * cy;
        const y2 = y * cx - z1 * sx;
        const z2 = y * sx + z1 * cx;
        const b = x1 * L[0] + y2 * L[1] + z2 * L[2];
        const el = shadeRefs.current[i];
        if (el) el.style.background = b > 0.55 ? `rgba(255,255,255,${(b - 0.55) * 0.55})` : `rgba(0,0,0,${Math.min(0.62, (0.55 - b) * 0.7)})`;
      });
      if (shineRef.current) shineRef.current.style.transform = `translate(${-cur.x * 0.6}%, ${-cur.y * 0.6}%)`;
      eyesRef.current?.setAttribute("transform", `translate(${cur.x * 0.18} ${-cur.y * 0.2})`);
    };

    const tick = () => {
      cur.x += (target.x - cur.x) * 0.12;
      cur.y += (target.y - cur.y) * 0.12;
      apply();
      raf = Math.abs(target.x - cur.x) + Math.abs(target.y - cur.y) > 0.05 ? requestAnimationFrame(tick) : 0;
    };
    const go = () => {
      if (!raf) raf = requestAnimationFrame(tick);
    };

    const onMove = (e: globalThis.PointerEvent) => {
      const r = root.getBoundingClientRect();
      const dx = (e.clientX - (r.left + r.width / 2)) / 260;
      const dy = (e.clientY - (r.top + r.height * 0.4)) / 260;
      target.x = BASE.x * 0.4 + Math.max(-1, Math.min(1, dx)) * 30;
      target.y = BASE.y * 0.5 - Math.max(-1, Math.min(1, dy)) * 16;
      lastMove = performance.now();
      go();
    };

    // When the pointer goes quiet, glance around on its own.
    const glance = () => {
      if (performance.now() - lastMove > 3000) {
        target.x = BASE.x + (Math.random() - 0.5) * 30;
        target.y = BASE.y + (Math.random() - 0.5) * 12;
        go();
      }
      idleTimer = window.setTimeout(glance, 1800 + Math.random() * 2200);
    };

    apply();
    if (followCursor && !reduced) {
      window.addEventListener("pointermove", onMove, { passive: true });
      idleTimer = window.setTimeout(glance, 2500);
    }
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(idleTimer);
      window.removeEventListener("pointermove", onMove);
    };
  }, [followCursor]);

  // Blinking.
  useEffect(() => {
    if (!interactive) return;
    let t = 0;
    const loop = () => {
      t = window.setTimeout(() => {
        setBlink(true);
        window.setTimeout(() => setBlink(false), 130);
        loop();
      }, 1800 + Math.random() * 3200);
    };
    loop();
    return () => clearTimeout(t);
  }, [interactive]);

  useEffect(() => () => clearTimeout(moodTimer.current), []);

  const react = (m: Mood, ms: number) => {
    setMood(m);
    clearTimeout(moodTimer.current);
    moodTimer.current = window.setTimeout(() => setMood("idle"), ms);
  };

  const squash = () =>
    squashRef.current?.animate(
      [
        { transform: "scale(1,1)" },
        { transform: "scale(1.1,0.86)", offset: 0.2 },
        { transform: "scale(0.95,1.07)", offset: 0.5 },
        { transform: "scale(1.02,0.98)", offset: 0.75 },
        { transform: "scale(1,1)" },
      ],
      { duration: 480, easing: "ease-out" },
    );

  const poke = () => {
    if (!interactive) return;
    squash();
    const now = performance.now();
    taps.current = [...taps.current.filter((t) => now - t < 2000), now];
    if (taps.current.length >= 5) {
      taps.current = [];
      react("dizzy", 2200);
    } else if (mood !== "dizzy") react("happy", 900);
  };

  const onDown = (e: PointerEvent<HTMLButtonElement>) => {
    pat.current = { x: e.clientX, dir: 0, turns: 0, t0: performance.now() };
  };
  // Petting: dragging side to side while pressed.
  const onDrag = (e: PointerEvent<HTMLButtonElement>) => {
    const p = pat.current;
    if (!p || !interactive || e.buttons === 0) return;
    const dx = e.clientX - p.x;
    if (Math.abs(dx) < 12) return;
    const dir = Math.sign(dx);
    if (p.dir && dir !== p.dir) p.turns++;
    p.dir = dir;
    p.x = e.clientX;
    if (p.turns >= 3 && performance.now() - p.t0 < 1500) {
      pat.current = null;
      react("love", 2600);
    }
  };

  const onKey = (e: KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      poke();
    }
  };

  const face = (i: number, f: (typeof FACES)[number]) => {
    const style: CSSProperties = {
      position: "absolute",
      inset: 0,
      transform: `${f.t} translateZ(${s / 2}px)`,
      background: color,
      backfaceVisibility: "hidden",
      borderRadius: s * 0.07,
      boxShadow: `inset 0 0 0 ${s * 0.018}px rgba(255,255,255,.28), inset 0 ${-s * 0.04}px ${s * 0.1}px rgba(0,0,0,.18)`,
      overflow: "hidden",
    };
    const banded = f.key !== "top" && f.key !== "bottom";
    return (
      <div key={f.key} style={style}>
        {banded && <div style={{ position: "absolute", left: 0, right: 0, top: "9%", height: "9%", background: accent }} />}
        <div style={{ position: "absolute", inset: 0, backgroundImage: NOISE, opacity: 0.12, mixBlendMode: "overlay" }} />
        <div ref={(el) => void (shadeRefs.current[i] = el)} style={{ position: "absolute", inset: 0 }} />
        {/* The screen emits its own light, so it sits above the face shading. */}
        {f.key === "front" && renderScreen()}
        {f.key === "front" && (
          <div
            ref={shineRef}
            style={{
              position: "absolute",
              inset: "-30%",
              background: "radial-gradient(circle at 30% 26%, rgba(255,255,255,.42), transparent 34%)",
              pointerEvents: "none",
            }}
          />
        )}
      </div>
    );
  };

  function renderScreen() {
    const eyeY = 34;
    const eyes = (x: number) => {
      if (mood === "happy") return <path d={`M${x - 8} ${eyeY + 4} Q${x} ${eyeY - 8} ${x + 8} ${eyeY + 4}`} stroke={ink} strokeWidth={5} strokeLinecap="round" fill="none" />;
      if (mood === "love")
        return (
          <path
            transform={`translate(${x} ${eyeY}) scale(0.9)`}
            d="M0 9 C-14 0 -9 -11 0 -4 C9 -11 14 0 0 9Z"
            fill="#ff5c8a"
          />
        );
      if (mood === "dizzy")
        return <path transform={`translate(${x} ${eyeY})`} d="M0 0 a2 2 0 1 1 3 1 a5 5 0 1 1 -8 -3 a8 8 0 1 1 13 5" stroke={ink} strokeWidth={3} fill="none" strokeLinecap="round" />;
      return <rect x={x - 6} y={eyeY - 10} width={12} height={20} rx={6} fill={ink} />;
    };
    const mouth =
      mood === "happy" ? (
        <path d="M40 50 Q50 64 60 50 Z" fill={ink} />
      ) : mood === "dizzy" ? (
        <path d="M39 55 q5.5 -5 11 0 t11 0" stroke={ink} strokeWidth={3.5} fill="none" strokeLinecap="round" />
      ) : (
        <path d="M42 51 Q50 58 58 51" stroke={ink} strokeWidth={4} fill="none" strokeLinecap="round" />
      );
    return (
      <div
        style={{
          position: "absolute",
          left: "14%",
          right: "14%",
          top: "27%",
          bottom: "13%",
          background: screen,
          borderRadius: s * 0.06,
          boxShadow: `inset 0 ${s * 0.02}px ${s * 0.05}px rgba(0,0,0,.22), 0 0 0 ${s * 0.012}px rgba(0,0,0,.18)`,
        }}
      >
        <svg viewBox="0 0 100 72" style={{ width: "100%", height: "100%", overflow: "visible" }} aria-hidden>
          <g ref={eyesRef}>
            <g
              style={{
                transform: blink && mood === "idle" ? "scaleY(0.1)" : "none",
                transformOrigin: `50px ${eyeY}px`,
                transition: "transform 90ms",
              }}
            >
              {eyes(32)}
              {eyes(68)}
            </g>
            <g opacity={mood === "love" || mood === "happy" ? 0.55 : 0} style={{ transition: "opacity .3s" }}>
              <ellipse cx={18} cy={50} rx={7} ry={4} fill="#ff7aa2" />
              <ellipse cx={82} cy={50} rx={7} ry={4} fill="#ff7aa2" />
            </g>
            {mouth}
          </g>
        </svg>
      </div>
    );
  }

  return (
    <button
      ref={rootRef}
      type="button"
      aria-label={`${label}. Press to boop.`}
      onClick={poke}
      onKeyDown={onKey}
      onPointerDown={onDown}
      onPointerMove={onDrag}
      className={className}
      style={{
        position: "relative",
        width: size,
        height: size,
        background: "none",
        border: 0,
        padding: 0,
        cursor: interactive ? "pointer" : "default",
        touchAction: "none",
        WebkitTapHighlightColor: "transparent",
      }}
    >
      <style href="glint-bot" precedence="default">
        {css}
      </style>
      {/* Ground shadow */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          left: "22%",
          right: "22%",
          bottom: "3%",
          height: "7%",
          borderRadius: "50%",
          background: "radial-gradient(closest-side, rgba(0,0,0,.45), transparent)",
          filter: "blur(2px)",
        }}
      />
      <div ref={squashRef} aria-hidden style={{ position: "absolute", inset: 0, transformOrigin: "50% 92%" }}>
        {/* Body: neck, torso and shoulder pads, shaded to match the key light. */}
        <svg viewBox="0 0 200 100" style={{ position: "absolute", left: "19%", width: "62%", bottom: "6%" }}>
          <defs>
            <linearGradient id="glint-bot-torso" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#fbf8ef" />
              <stop offset="1" stopColor="#cfc7b1" />
            </linearGradient>
            <radialGradient id="glint-bot-pad" cx="0.35" cy="0.3" r="0.8">
              <stop offset="0" stopColor="#fff" stopOpacity=".55" />
              <stop offset="0.35" stopColor={color} />
              <stop offset="1" stopColor={color} stopOpacity=".55" />
            </radialGradient>
          </defs>
          <rect x="80" y="0" width="40" height="26" rx="8" fill="#d9d1bb" />
          <path d="M30 100 C30 52 60 22 100 22 C140 22 170 52 170 100Z" fill="url(#glint-bot-torso)" />
          <rect x="80" y="62" width="40" height="10" rx="5" fill={color} opacity=".85" />
          <circle cx="42" cy="68" r="20" fill="url(#glint-bot-pad)" />
          <circle cx="158" cy="68" r="20" fill="url(#glint-bot-pad)" />
        </svg>
        {/* Head */}
        <div
          style={{
            position: "absolute",
            left: (size - s) / 2,
            top: size * 0.1,
            width: s,
            height: s,
            animation: mood === "dizzy" ? "glint-bot-wobble .5s ease-in-out infinite" : "glint-bot-float 3.2s ease-in-out infinite",
            // Perspective must sit on the rotating head's direct parent, or the 3D gets flattened.
            perspective: size * 1.9,
          }}
        >
          <div ref={headRef} style={{ position: "absolute", inset: 0, transformStyle: "preserve-3d" }}>
            {FACES.map((f, i) => face(i, f))}
          </div>
        </div>
      </div>
    </button>
  );
}
