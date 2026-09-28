"use client";

import { useEffect, useId, useRef } from "react";

export interface FacescapeProps {
  /** Face size in px. */
  size?: number;
  /** Head color. */
  faceColor?: string;
  /** Eyes, brows and mouth color. */
  featureColor?: string;
  /** Blush color. */
  cheekColor?: string;
  /** How strongly the face turns toward the cursor, 0-2. */
  follow?: number;
  /** Blink every few seconds. */
  blink?: boolean;
  /** Accessible description. */
  label?: string;
  className?: string;
}

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const clamp = (v: number, lo = 0, hi = 1) => Math.min(hi, Math.max(lo, v));

// Mouth shapes: [half width, upper-lip bend, lower-lip bend]. Blended every frame.
const NEUTRAL = [15, 1, 5];
const GRIN = [23, 6, 26];
const OOH = [9, -11, 13];

/**
 * A little face that watches the pointer inside its parent element: pupils track,
 * the head turns, brows lift and it grins as you get close. Click or press Enter to boop.
 */
export function Facescape({
  size = 280,
  faceColor = "#ffd166",
  featureColor = "#1c1917",
  cheekColor = "#ff8fab",
  follow = 1,
  blink = true,
  label = "Illustrated face that follows your cursor",
  className,
}: FacescapeProps) {
  const root = useRef<HTMLDivElement>(null);
  const svg = useRef<SVGSVGElement>(null);
  const opts = useRef({ follow, blink });
  const boop = useRef(0);
  const shade = `facescape-${useId().replace(/:/g, "")}`;

  useEffect(() => {
    const el = root.current;
    const s = svg.current;
    if (!el || !s) return;
    const q = <T extends Element>(sel: string) => s.querySelector(sel) as T;
    const head = q<SVGGElement>("[data-head]");
    const features = q<SVGGElement>("[data-features]");
    const pupils = s.querySelectorAll<SVGGElement>("[data-pupil]");
    const lids = s.querySelectorAll<SVGGElement>("[data-eye]");
    const brows = s.querySelectorAll<SVGPathElement>("[data-brow]");
    const mouth = q<SVGPathElement>("[data-mouth]");
    const cheeks = q<SVGGElement>("[data-cheeks]");
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const area = el.parentElement ?? el;

    // Target (pointer) and smoothed state.
    const target = { x: 0, y: 0, near: 0, active: false };
    const cur = { x: 0, y: 0, near: 0, ooh: 0 };
    let nextBlink = performance.now() + 1800;
    let blinkAt = -1e9;
    let raf = 0;
    let visible = true;

    const onMove = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      const cx = r.left + r.width / 2;
      const cy = r.top + r.height / 2;
      const dx = e.clientX - cx;
      const dy = e.clientY - cy;
      const reach = Math.max(r.width, 1) * 1.6;
      target.x = clamp(dx / reach, -1, 1);
      target.y = clamp(dy / reach, -1, 1);
      target.near = clamp(1 - Math.hypot(dx, dy) / reach);
      target.active = true;
    };
    const onLeave = () => {
      target.active = false;
      target.near = 0;
    };

    const draw = (t: number) => {
      const o = opts.current;
      // Idle: glance around slowly when nobody is pointing.
      const tx = target.active ? target.x : Math.sin(t / 1900) * 0.5;
      const ty = target.active ? target.y : Math.sin(t / 2700) * 0.25 - 0.05;
      const k = reduced ? 1 : 0.12;
      cur.x = lerp(cur.x, tx, k);
      cur.y = lerp(cur.y, ty, k);
      cur.near = lerp(cur.near, target.near, reduced ? 1 : 0.08);
      const booping = t < boop.current;
      cur.ooh = lerp(cur.ooh, booping ? 1 : 0, reduced ? 1 : 0.2);

      if (o.blink && !reduced && t > nextBlink) {
        blinkAt = t;
        // Occasionally a double blink.
        nextBlink = t + (Math.random() < 0.2 ? 260 : 2200 + Math.random() * 3400);
      }
      const b = (t - blinkAt) / 170;
      const lid = b < 1 ? 1 - Math.sin(b * Math.PI) * 0.92 : 1;

      const f = o.follow;
      head.setAttribute("transform", `translate(${cur.x * 6 * f} ${cur.y * 5 * f}) rotate(${cur.x * 5 * f} 100 100)`);
      features.setAttribute("transform", `translate(${cur.x * 12 * f} ${cur.y * 9 * f})`);
      for (const p of pupils) p.setAttribute("transform", `translate(${cur.x * 7} ${cur.y * 8})`);
      const squint = cur.near * 0.12 * (1 - cur.ooh);
      const open = lid * (1 - squint) + cur.ooh * 0.15;
      for (const l of lids) l.setAttribute("transform", `translate(0 94) scale(1 ${open}) translate(0 -94)`);

      const lift = cur.near * 5 + cur.ooh * 9;
      const tilt = cur.near * 4 + cur.ooh * 6;
      brows.forEach((b, i) => {
        const side = i ? 1 : -1;
        const cx = 100 + side * 28;
        const y = 58 - lift - cur.y * 3;
        const inner = cx - side * 13;
        const outer = cx + side * 13;
        b.setAttribute("d", `M${inner} ${y + 2 - tilt * 0.3} Q${cx} ${y - 5 - tilt * 0.5} ${outer} ${y + 2 + tilt * 0.4}`);
      });

      const g = clamp(cur.near * 1.3) * (1 - cur.ooh);
      const m = [0, 1, 2].map((i) => lerp(lerp(NEUTRAL[i], GRIN[i], g), OOH[i], cur.ooh));
      const my = 132;
      mouth.setAttribute("d", `M${100 - m[0]} ${my} Q100 ${my + m[1]} ${100 + m[0]} ${my} Q100 ${my + m[2]} ${100 - m[0]} ${my}Z`);
      cheeks.setAttribute("opacity", String(0.35 + cur.near * 0.5));

      if (visible) raf = requestAnimationFrame(draw);
    };

    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      cancelAnimationFrame(raf);
      if (visible) raf = requestAnimationFrame(draw);
    });
    io.observe(el);
    area.addEventListener("pointermove", onMove);
    area.addEventListener("pointerleave", onLeave);
    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      area.removeEventListener("pointermove", onMove);
      area.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  useEffect(() => {
    opts.current = { follow, blink };
  }, [follow, blink]);

  const trigger = () => {
    boop.current = performance.now() + 650;
  };

  return (
    <div
      ref={root}
      role="img"
      aria-label={label}
      tabIndex={0}
      onPointerDown={trigger}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          trigger();
        }
      }}
      className={`relative cursor-pointer select-none rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-4 focus-visible:ring-offset-background ${className ?? ""}`}
      style={{ width: size, height: size }}
    >
      <svg ref={svg} viewBox="0 0 200 200" className="size-full overflow-visible" aria-hidden>
        <ellipse cx="100" cy="190" rx="58" ry="7" fill="#000" opacity=".25" />
        <g data-head>
          <rect x="18" y="18" width="164" height="164" rx="74" fill={faceColor} />
          {/* Soft top light and bottom shade give the flat shape some volume. */}
          <rect x="18" y="18" width="164" height="164" rx="74" fill={`url(#${shade})`} />
          <g data-features>
            <g data-cheeks fill={cheekColor} opacity=".35">
              <ellipse cx="56" cy="122" rx="15" ry="9" />
              <ellipse cx="144" cy="122" rx="15" ry="9" />
            </g>
            {[72, 128].map((cx) => (
              <g key={cx} data-eye="">
                <ellipse cx={cx} cy="94" rx="15" ry="18" fill="#fff" />
                <g data-pupil="">
                  <circle cx={cx} cy="95" r="8.5" fill={featureColor} />
                  <circle cx={cx + 3} cy="91" r="2.6" fill="#fff" />
                </g>
              </g>
            ))}
            <path data-brow="" d="M85 60 Q72 53 59 60" fill="none" stroke={featureColor} strokeWidth="6" strokeLinecap="round" />
            <path data-brow="" d="M115 60 Q128 53 141 60" fill="none" stroke={featureColor} strokeWidth="6" strokeLinecap="round" />
            <path d="M97 110 Q100 114 103 110" fill="none" stroke={featureColor} strokeOpacity=".45" strokeWidth="3.5" strokeLinecap="round" />
            <path
              data-mouth=""
              d="M85 132 Q100 133 115 132 Q100 137 85 132Z"
              fill={featureColor}
              stroke={featureColor}
              strokeWidth="4"
              strokeLinejoin="round"
            />
          </g>
        </g>
        <defs>
          <linearGradient id={shade} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#fff" stopOpacity=".35" />
            <stop offset=".45" stopColor="#fff" stopOpacity="0" />
            <stop offset="1" stopColor="#000" stopOpacity=".16" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}
