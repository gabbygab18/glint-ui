"use client";

import { useRef, type CSSProperties, type PointerEvent, type ReactNode } from "react";
import { BarChart3, LayoutDashboard, Plug, ShieldCheck, Users, Workflow } from "lucide-react";

export interface BentoItem {
  label: string;
  title: string;
  description: string;
  icon?: ReactNode;
}

export interface MagicBentoProps {
  items?: BentoItem[];
  /** Glow, spotlight and particle color. */
  glowColor?: string;
  /** Px radius of the cursor spotlight. */
  spotlightRadius?: number;
  /** Max card tilt in degrees (0 disables). */
  tilt?: number;
  /** Floating particles inside the hovered card. */
  particles?: boolean;
  /** Particles per card. */
  particleCount?: number;
  className?: string;
}

const DEFAULT_ITEMS: BentoItem[] = [
  { label: "Insights", title: "Analytics", description: "Track every signal in real time and spot trends before they become problems.", icon: <BarChart3 /> },
  { label: "Overview", title: "Dashboard", description: "One calm view of everything.", icon: <LayoutDashboard /> },
  { label: "Teamwork", title: "Collaboration", description: "Work together, live.", icon: <Users /> },
  { label: "Efficiency", title: "Automation", description: "Hand the busywork to workflows that run while you sleep.", icon: <Workflow /> },
  { label: "Connectivity", title: "Integrations", description: "Plug into 200+ tools.", icon: <Plug /> },
  { label: "Protection", title: "Security", description: "Encrypted at rest and in transit, audited by default.", icon: <ShieldCheck /> },
];

// Grid placement for the 4-column layout: a hero tile, two squares, two wide tiles.
const SPANS = [
  "col-span-2 md:row-span-2",
  "",
  "",
  "md:col-span-2",
  "md:col-span-2",
  "col-span-2",
];

function hexToRgb(hex: string) {
  const h = hex.replace("#", "");
  const n = parseInt(h.length === 3 ? h.replace(/./g, "$&$&") : h.padEnd(6, "0").slice(0, 6), 16);
  return `${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}`;
}

// Deterministic pseudo-random so SSR and client agree.
// Integer hash (mulberry32 step), identical on server and client.
const rand = (seed: number) => {
  let t = Math.imul(seed + 1, 0x6d2b79f5);
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};
const f = (n: number) => n.toFixed(2);

const css = `
.mb-card{--mx:50%;--my:50%;--glow:0;--hover:0;transition:transform .45s cubic-bezier(.2,.7,.2,1),box-shadow .45s}
.mb-card::before,.mb-card::after{content:"";position:absolute;inset:0;border-radius:inherit;pointer-events:none}
.mb-card::before{background:radial-gradient(var(--r) circle at var(--mx) var(--my),rgba(var(--c),.16),transparent 70%);opacity:var(--glow)}
.mb-card::after{padding:1.5px;background:radial-gradient(calc(var(--r)*.8) circle at var(--mx) var(--my),rgba(var(--c),1),rgba(var(--c),.55) 40%,transparent 75%);opacity:var(--glow);
  -webkit-mask:linear-gradient(#000 0 0) content-box,linear-gradient(#000 0 0);-webkit-mask-composite:xor;mask:linear-gradient(#000 0 0) content-box exclude,linear-gradient(#000 0 0)}
.mb-card:hover{box-shadow:0 20px 50px -20px rgba(var(--c),.35)}
.mb-dot{position:absolute;border-radius:9999px;background:rgb(var(--c));box-shadow:0 0 8px rgba(var(--c),.9);opacity:0;transition:opacity .5s;animation:mb-float var(--d) ease-in-out var(--delay) infinite alternate}
.mb-card:hover .mb-dot{opacity:var(--o)}
@keyframes mb-float{to{transform:translate(var(--tx),var(--ty)) scale(.4)}}
@media (prefers-reduced-motion:reduce){.mb-card{transition:none}.mb-dot{animation:none}}
`;

export function MagicBento({
  items = DEFAULT_ITEMS,
  glowColor = "#a78bfa",
  spotlightRadius = 320,
  tilt = 6,
  particles = true,
  particleCount = 10,
  className,
}: MagicBentoProps) {
  const cards = useRef<(HTMLElement | null)[]>([]);

  // One listener on the grid feeds every card, so neighbours glow as the cursor approaches.
  const onMove = (e: PointerEvent<HTMLDivElement>) => {
    for (const el of cards.current) {
      if (!el) continue;
      const r = el.getBoundingClientRect();
      const x = e.clientX - r.left;
      const y = e.clientY - r.top;
      const dx = Math.max(0, -x, x - r.width);
      const dy = Math.max(0, -y, y - r.height);
      const glow = Math.max(0, 1 - Math.hypot(dx, dy) / (spotlightRadius * 0.6));
      el.style.setProperty("--mx", `${x}px`);
      el.style.setProperty("--my", `${y}px`);
      el.style.setProperty("--glow", glow.toFixed(3));
      const inside = dx === 0 && dy === 0;
      if (tilt && inside && !matchMedia("(prefers-reduced-motion: reduce)").matches) {
        const rx = (0.5 - y / r.height) * tilt;
        const ry = (x / r.width - 0.5) * tilt;
        el.style.transform = `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg) translateZ(0)`;
      } else el.style.transform = "";
    }
  };

  const onLeave = () => {
    for (const el of cards.current) {
      if (!el) continue;
      el.style.setProperty("--glow", "0");
      el.style.transform = "";
    }
  };

  return (
    <div
      onPointerMove={onMove}
      onPointerLeave={onLeave}
      className={`grid w-full max-w-4xl grid-cols-2 gap-3 md:auto-rows-[8rem] md:grid-cols-4 ${className ?? ""}`}
      style={{ ["--c" as string]: hexToRgb(glowColor), ["--r" as string]: `${spotlightRadius}px` }}
    >
      <style href="magic-bento" precedence="default">
        {css}
      </style>
      {items.map((item, i) => (
        <article
          key={item.title + i}
          ref={(el) => {
            cards.current[i] = el;
          }}
          className={`mb-card group relative flex min-h-32 flex-col justify-between overflow-hidden rounded-2xl border border-border bg-card p-5 ${SPANS[i % SPANS.length]}`}
        >
          {particles &&
            Array.from({ length: particleCount }, (_, k) => {
              const s = i * 97 + k * 13;
              const size = f(2 + rand(s) * 3);
              return (
                <span
                  key={k}
                  aria-hidden
                  className="mb-dot"
                  style={
                    {
                      left: `${f(rand(s + 1) * 100)}%`,
                      top: `${f(rand(s + 2) * 100)}%`,
                      width: `${size}px`,
                      height: `${size}px`,
                      "--o": f(0.4 + rand(s + 3) * 0.6),
                      "--tx": `${f((rand(s + 4) - 0.5) * 60)}px`,
                      "--ty": `${f((rand(s + 5) - 0.5) * 60)}px`,
                      "--d": `${f(2.5 + rand(s + 6) * 3)}s`,
                      "--delay": `${f(-rand(s + 7) * 4)}s`,
                    } as CSSProperties
                  }
                />
              );
            })}
          <div className="relative flex items-center justify-between">
            <span className="rounded-full border border-border bg-muted/60 px-2.5 py-1 text-xs font-medium text-muted-foreground">
              {item.label}
            </span>
            {item.icon && <span className="text-muted-foreground [&>svg]:size-5">{item.icon}</span>}
          </div>
          <div className="relative">
            <h3 className={`font-semibold tracking-tight text-foreground ${i === 0 ? "text-2xl md:text-3xl" : "text-base"}`}>
              {item.title}
            </h3>
            <p className={`mt-1 text-muted-foreground ${i === 0 ? "max-w-xs text-sm" : "text-xs leading-relaxed"}`}>
              {item.description}
            </p>
          </div>
        </article>
      ))}
    </div>
  );
}
