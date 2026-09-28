"use client";

import { useEffect, useRef, useState, type CSSProperties, type KeyboardEvent, type PointerEvent } from "react";

export interface GlintBotProps {
  /** Overall size in px (the bot fits a size x size box). */
  size?: number;
  /** Head shell color. */
  color?: string;
  /** Band around the top of the head. */
  accent?: string;
  /** Visor glass color. */
  screen?: string;
  /** Lens and grille glow color. */
  ink?: string;
  /** Turn the head toward the pointer. */
  followCursor?: boolean;
  /** Raise the right arm and wave. */
  wave?: boolean;
  /** Blink, react to clicks, blush when petted, get dizzy when poked. */
  interactive?: boolean;
  label?: string;
  className?: string;
}

type Mood = "idle" | "happy" | "love" | "dizzy";

// Face normals in CSS space (x right, y down, z toward the viewer).
const FACES = [
  { key: "front", n: [0, 0, 1] },
  { key: "back", n: [0, 0, -1] },
  { key: "right", n: [1, 0, 0] },
  { key: "left", n: [-1, 0, 0] },
  { key: "top", n: [0, -1, 0] },
  { key: "bottom", n: [0, 1, 0] },
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
@keyframes glint-bot-float{0%,100%{transform:translateY(0)}50%{transform:translateY(-2.5%)}}
@keyframes glint-bot-wobble{0%,100%{transform:rotate(0)}25%{transform:rotate(-7deg)}75%{transform:rotate(7deg)}}
@keyframes glint-bot-wave{0%,100%{transform:rotate(-12deg)}50%{transform:rotate(22deg)}}
@keyframes glint-bot-reel{to{transform:rotate(360deg)}}
@media (prefers-reduced-motion:reduce){.glint-bot-anim{animation:none!important}}
`;

// Body art lives in a 100x100 box that maps onto the component's size x size square.
const HEAD = { w: 46, h: 29, d: 30, top: 6 }; // percent of size

export function GlintBot({
  size = 280,
  color = "#b5e61d",
  accent = "#f4b860",
  screen = "#141a0f",
  ink = "#d9ff6b",
  followCursor = true,
  wave = false,
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

  const W = (size * HEAD.w) / 100;
  const H = (size * HEAD.h) / 100;
  const D = (size * HEAD.d) / 100;

  // Head follows the pointer; lighting is recomputed from the rotated face normals.
  useEffect(() => {
    const root = rootRef.current!;
    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    // Resting 3/4 pose shows the top and one side, so it reads as 3D before the pointer moves.
    const BASE = { x: -16, y: -8 };
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
        const x1 = x * cy + z * sy;
        const z1 = -x * sy + z * cy;
        const y2 = y * cx - z1 * sx;
        const z2 = y * sx + z1 * cx;
        const b = x1 * L[0] + y2 * L[1] + z2 * L[2];
        const el = shadeRefs.current[i];
        if (el) el.style.background = b > 0.55 ? `rgba(255,255,255,${(b - 0.55) * 0.55})` : `rgba(0,0,0,${Math.min(0.62, (0.55 - b) * 0.7)})`;
      });
      if (shineRef.current) shineRef.current.style.transform = `translate(${-cur.x * 0.6}%, ${-cur.y * 0.6}%)`;
      eyesRef.current?.setAttribute("transform", `translate(${cur.x * 0.12} ${-cur.y * 0.14})`);
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
      const dy = (e.clientY - (r.top + r.height * 0.22)) / 260;
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

  // Blinking: the visor lids drop over the lenses.
  useEffect(() => {
    if (!interactive) return;
    let t = 0;
    const loop = () => {
      t = window.setTimeout(() => {
        setBlink(true);
        window.setTimeout(() => setBlink(false), 140);
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
        { transform: "scale(1.08,0.9)", offset: 0.2 },
        { transform: "scale(0.96,1.05)", offset: 0.5 },
        { transform: "scale(1.02,0.99)", offset: 0.75 },
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

  // ---- Head (a real CSS-3D box) ----

  const faceBox = (key: (typeof FACES)[number]["key"]) => {
    const half = { x: W / 2, y: H / 2, z: D / 2 };
    switch (key) {
      case "front":
        return { w: W, h: H, t: `translateZ(${half.z}px)` };
      case "back":
        return { w: W, h: H, t: `rotateY(180deg) translateZ(${half.z}px)` };
      case "right":
        return { w: D, h: H, t: `rotateY(90deg) translateZ(${half.x}px)` };
      case "left":
        return { w: D, h: H, t: `rotateY(-90deg) translateZ(${half.x}px)` };
      case "top":
        return { w: W, h: D, t: `rotateX(90deg) translateZ(${half.y}px)` };
      case "bottom":
        return { w: W, h: D, t: `rotateX(-90deg) translateZ(${half.y}px)` };
    }
  };

  const renderVisor = () => {
    const lens = (cx: number) => {
      const reel =
        mood === "happy" ? (
          <path d={`M${cx - 9} ${31} Q${cx} ${20} ${cx + 9} ${31}`} stroke={ink} strokeWidth={4} fill="none" strokeLinecap="round" />
        ) : mood === "love" ? (
          <path transform={`translate(${cx} 29) scale(0.95)`} d="M0 9 C-14 0 -9 -11 0 -4 C9 -11 14 0 0 9Z" fill="#ff5c8a" />
        ) : (
          <g
            className="glint-bot-anim"
            style={{
              transformBox: "fill-box",
              transformOrigin: "center",
              animation: `glint-bot-reel ${mood === "dizzy" ? 0.35 : 6}s linear infinite`,
            }}
          >
            <circle cx={cx} cy={28} r={11} fill={ink} opacity={0.9} />
            {[0, 120, 240].map((deg) => (
              <circle
                key={deg}
                cx={cx + Math.cos((deg * Math.PI) / 180) * 6}
                cy={28 + Math.sin((deg * Math.PI) / 180) * 6}
                r={3}
                fill={screen}
              />
            ))}
            <circle cx={cx} cy={28} r={2.2} fill={screen} />
          </g>
        );
      return (
        <g key={cx}>
          <circle cx={cx} cy={28} r={17} fill="#0b0f08" stroke="#cfd3c5" strokeWidth={2.5} />
          <circle cx={cx} cy={28} r={13.5} fill="none" stroke={ink} strokeOpacity={0.18} strokeWidth={1} />
          {reel}
          {/* Lid for blinking */}
          <rect
            x={cx - 17}
            y={11}
            width={34}
            height={34}
            fill={screen}
            style={{
              transformBox: "fill-box",
              transformOrigin: "top",
              transform: `scaleY(${blink && mood === "idle" ? 1 : 0})`,
              transition: "transform 90ms",
            }}
          />
        </g>
      );
    };
    // Speaker grille: dots that curve into a smile when happy.
    const dots = [0, 1, 2, 3, 4].map((i) => {
      const x = 44 + i * 8;
      const lift = mood === "happy" || mood === "love" ? [0, 2.5, 3.5, 2.5, 0][i] : mood === "dizzy" ? [1, -1, 1, -1, 1][i] : 0;
      return <circle key={i} cx={x} cy={52 + lift} r={2.4} fill={ink} opacity={mood === "idle" ? 0.55 : 0.95} />;
    });

    return (
      <div
        style={{
          position: "absolute",
          left: "8%",
          right: "8%",
          top: "16%",
          bottom: "12%",
          background: `linear-gradient(180deg, color-mix(in oklab, ${screen} 80%, white), ${screen} 45%)`,
          borderRadius: W * 0.08,
          boxShadow: `inset 0 ${W * 0.02}px ${W * 0.05}px rgba(0,0,0,.55), 0 0 0 ${W * 0.012}px rgba(0,0,0,.35)`,
          overflow: "hidden",
        }}
      >
        <svg viewBox="0 0 120 62" preserveAspectRatio="xMidYMid meet" style={{ width: "100%", height: "100%" }} aria-hidden>
          <g ref={eyesRef}>
            {lens(38)}
            {lens(82)}
            {dots}
            <g opacity={mood === "love" || mood === "happy" ? 0.6 : 0} style={{ transition: "opacity .3s" }}>
              <ellipse cx={14} cy={44} rx={7} ry={3.5} fill="#ff7aa2" />
              <ellipse cx={106} cy={44} rx={7} ry={3.5} fill="#ff7aa2" />
            </g>
          </g>
        </svg>
        {/* Glass reflection */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "linear-gradient(115deg, rgba(255,255,255,.22) 0 18%, transparent 30% 100%)",
            pointerEvents: "none",
          }}
        />
      </div>
    );
  };

  const face = (i: number, f: (typeof FACES)[number]) => {
    const box = faceBox(f.key);
    const style: CSSProperties = {
      position: "absolute",
      left: (W - box.w) / 2,
      top: (H - box.h) / 2,
      width: box.w,
      height: box.h,
      transform: box.t,
      background: color,
      backfaceVisibility: "hidden",
      borderRadius: Math.min(box.w, box.h) * 0.14,
      boxShadow: `inset 0 0 0 ${size * 0.006}px rgba(255,255,255,.3), inset 0 ${-size * 0.012}px ${size * 0.03}px rgba(0,0,0,.18)`,
      overflow: "hidden",
    };
    const banded = f.key !== "top" && f.key !== "bottom";
    return (
      <div key={f.key} style={style}>
        {banded && <div style={{ position: "absolute", left: 0, right: 0, top: "6%", height: "7%", background: accent }} />}
        <div style={{ position: "absolute", inset: 0, backgroundImage: NOISE, opacity: 0.12, mixBlendMode: "overlay" }} />
        <div ref={(el) => void (shadeRefs.current[i] = el)} style={{ position: "absolute", inset: 0 }} />
        {/* The visor emits its own light, so it sits above the face shading. */}
        {f.key === "front" && renderVisor()}
        {f.key === "front" && (
          <div
            ref={shineRef}
            style={{
              position: "absolute",
              inset: "-30%",
              background: "radial-gradient(circle at 28% 22%, rgba(255,255,255,.35), transparent 32%)",
              pointerEvents: "none",
            }}
          />
        )}
      </div>
    );
  };

  // ---- Body (SVG in a 100x100 box) ----

  const arm = (side: 1 | -1, raised: boolean) => {
    // side: -1 = left (viewer's left), 1 = right
    const sx = 50 + side * 15;
    const sy = 55;
    const limb = (x1: number, y1: number, x2: number, y2: number) => (
      <>
        <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="url(#glint-bot-limb)" strokeWidth={5.2} strokeLinecap="round" />
        <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="rgba(255,255,255,.55)" strokeWidth={1.2} strokeLinecap="round" transform="translate(-0.8 -0.8)" />
      </>
    );
    const joint = (x: number, y: number, r = 2.6) => (
      <>
        <circle cx={x} cy={y} r={r} fill="#6b7063" />
        <circle cx={x - r * 0.3} cy={y - r * 0.3} r={r * 0.45} fill="rgba(255,255,255,.35)" />
      </>
    );
    const claw = (x: number, y: number, rot: number) => (
      <g transform={`translate(${x} ${y}) rotate(${rot})`}>
        <rect x={-2.8} y={-1.5} width={5.6} height={4.5} rx={1.6} fill="#7c8174" />
        <rect x={-3} y={2.4} width={2} height={3.2} rx={1} fill="#5c6056" />
        <rect x={1} y={2.4} width={2} height={3.2} rx={1} fill="#5c6056" />
      </g>
    );

    if (raised) {
      // Upper arm out and up; forearm waves around the elbow.
      const ex = sx + side * 10;
      const ey = sy - 7;
      return (
        <g key="raised">
          {limb(sx, sy, ex, ey)}
          <g
            className="glint-bot-anim"
            style={{ transformBox: "view-box", transformOrigin: `${ex}px ${ey}px`, animation: "glint-bot-wave 1s ease-in-out infinite" }}
          >
            {limb(ex, ey, ex + side * 2, ey - 14)}
            {claw(ex + side * 2, ey - 16, 180)}
          </g>
          {joint(ex, ey)}
          {joint(sx, sy, 3.6)}
        </g>
      );
    }
    // Hands on hips.
    const ex = sx + side * 10;
    const ey = sy + 10;
    const hx = sx + side * 2;
    const hy = sy + 21;
    return (
      <g key={`hip-${side}`}>
        {limb(sx, sy, ex, ey)}
        {limb(ex, ey, hx, hy)}
        {joint(ex, ey)}
        {claw(hx, hy, side * 70)}
        {joint(sx, sy, 3.6)}
      </g>
    );
  };

  const body = (
    <svg viewBox="0 0 100 100" overflow="visible" style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}>
      <defs>
        <linearGradient id="glint-bot-shell" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#fdfdf8" />
          <stop offset="0.45" stopColor="#f1f0e8" />
          <stop offset="1" stopColor="#b9b6a8" />
        </linearGradient>
        <linearGradient id="glint-bot-limb" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#f7f6ef" />
          <stop offset="1" stopColor="#b8b5a7" />
        </linearGradient>
        <linearGradient id="glint-bot-coil" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#9a9e92" />
          <stop offset="0.5" stopColor="#e8e8e0" />
          <stop offset="1" stopColor="#6f7368" />
        </linearGradient>
      </defs>

      {/* Ground shadow */}
      <ellipse cx={50} cy={95} rx={22} ry={3} fill="rgba(0,0,0,.35)" style={{ filter: "blur(1.5px)" }} />

      {/* Back arm (left), then torso, then front arm (right) */}
      {arm(-1, false)}

      {/* Torso: capsule that flares into a skirt with fins */}
      <path
        d="M38 56 C38 48.5 43 46.5 50 46.5 C57 46.5 62 48.5 62 56 L64.5 77 C70 79 72.5 83 72.5 92 L27.5 92 C27.5 83 30 79 35.5 77 Z"
        fill="url(#glint-bot-shell)"
        stroke="rgba(0,0,0,.18)"
        strokeWidth={0.6}
      />
      {/* Lime side stripe and base band */}
      <path d="M40.5 57 C40.5 52 42 50 44 49.5 L44.5 76 L39 78 Z" fill={color} opacity={0.9} />
      <path d="M29.5 86 L70.5 86 L72.5 92 L27.5 92 Z" fill={color} />
      <path d="M29.5 86 L70.5 86 L71 87.4 L29 87.4 Z" fill="rgba(255,255,255,.4)" />
      {/* Fin gaps */}
      <rect x={36} y={80} width={1.6} height={12} rx={0.8} fill="rgba(0,0,0,.18)" />
      <rect x={62.4} y={80} width={1.6} height={12} rx={0.8} fill="rgba(0,0,0,.18)" />
      {/* Chest spark emblem */}
      <g transform="translate(53 60) scale(0.5)">
        <circle r={7} fill="none" stroke={color} strokeWidth={1.8} />
        <path d="M0 -5 L1.3 -1.3 L5 0 L1.3 1.3 L0 5 L-1.3 1.3 L-5 0 L-1.3 -1.3 Z" fill={color} />
      </g>
      {/* Control panel */}
      <rect x={45} y={68} width={16} height={5} rx={1.2} fill="#2a2e25" />
      <circle cx={48} cy={70.5} r={0.9} fill={ink} />
      <circle cx={51} cy={70.5} r={0.9} fill={ink} opacity={0.5} />
      <rect x={53.5} y={69.8} width={5.5} height={1.4} rx={0.7} fill="#6b7063" />
      <rect x={45} y={74.5} width={16} height={1.2} rx={0.6} fill="#2a2e25" opacity={0.6} />

      {arm(1, wave)}

      {/* Coil-spring neck */}
      {[0, 1, 2, 3, 4].map((i) => (
        <ellipse key={i} cx={50} cy={36.8 + i * 2.4} rx={5.5 - i * 0.2} ry={1.4} fill="none" stroke="url(#glint-bot-coil)" strokeWidth={1.4} />
      ))}
    </svg>
  );

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
      <div ref={squashRef} aria-hidden style={{ position: "absolute", inset: 0, transformOrigin: "50% 94%" }}>
        {body}
        {/* Head */}
        <div
          className="glint-bot-anim"
          style={{
            position: "absolute",
            left: (size - W) / 2,
            top: (size * HEAD.top) / 100,
            width: W,
            height: H,
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
