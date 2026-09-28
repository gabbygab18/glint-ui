"use client";

// Shared sample content for demos. Not part of any component's source.
import type { ReactNode } from "react";

/** Stable remote sample images (CORS-enabled, safe for WebGL textures). */
export const demoImages = (count: number, w = 600, h = 800) =>
  Array.from({ length: count }, (_, i) => `https://picsum.photos/seed/glint-${i + 1}/${w}/${h}`);

export const Title = ({ children }: { children: ReactNode }) => (
  <div className="pointer-events-none relative z-10 text-center">
    <p className="text-3xl font-semibold tracking-tight text-foreground sm:text-5xl">{children}</p>
  </div>
);

export const Card = ({ title, body }: { title: string; body: string }) => (
  <div className="w-72 rounded-2xl border border-border bg-card p-6">
    <div className="mb-10 size-10 rounded-lg bg-gradient-to-br from-lime-300 to-cyan-400" />
    <h3 className="text-lg font-semibold text-foreground">{title}</h3>
    <p className="mt-1 text-sm text-muted-foreground">{body}</p>
  </div>
);

const icon = (d: string) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
  </svg>
);

export const dockItems = [
  { label: "Home", icon: icon("M3 10l9-7 9 7v10a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1z") },
  { label: "Search", icon: icon("M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14zm10 3-5.2-5.2") },
  { label: "Mail", icon: icon("M3 6h18v12H3zm0 0 9 7 9-7") },
  { label: "Music", icon: icon("M9 18V5l12-2v13M9 18a3 3 0 1 1-6 0 3 3 0 0 1 6 0zm12-2a3 3 0 1 1-6 0 3 3 0 0 1 6 0z") },
  { label: "Settings", icon: icon("M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm7.4-3a7.4 7.4 0 0 0-.1-1.2l2-1.6-2-3.4-2.4 1a7.5 7.5 0 0 0-2-1.2L14.5 3h-5l-.4 2.6a7.5 7.5 0 0 0-2 1.2l-2.4-1-2 3.4 2 1.6a7.4 7.4 0 0 0 0 2.4l-2 1.6 2 3.4 2.4-1a7.5 7.5 0 0 0 2 1.2l.4 2.6h5l.4-2.6a7.5 7.5 0 0 0 2-1.2l2.4 1 2-3.4-2-1.6c.1-.4.1-.8.1-1.2z") },
];

export const notifications = [
  { who: "Vercel", what: "Deployment ready", tint: "bg-white" },
  { who: "Supabase", what: "New sign-up: ana@acme.dev", tint: "bg-emerald-400" },
  { who: "GitHub", what: "PR #128 merged", tint: "bg-violet-400" },
  { who: "Stripe", what: "Payment received: $49.00", tint: "bg-indigo-400" },
  { who: "Linear", what: "ENG-42 moved to Done", tint: "bg-cyan-400" },
].map((n) => (
  <div key={n.who} className="flex w-80 items-center gap-3 rounded-xl border border-border bg-card/90 p-3">
    <span className={`size-9 shrink-0 rounded-lg ${n.tint}`} />
    <div>
      <p className="text-sm font-medium text-foreground">{n.who}</p>
      <p className="text-xs text-muted-foreground">{n.what}</p>
    </div>
  </div>
));

export const logos = ["Next.js", "Supabase", "Vercel", "React", "Tailwind", "TypeScript", "Figma"].map((name) => (
  <span key={name} className="text-2xl font-semibold tracking-tight text-muted-foreground">
    {name}
  </span>
));

export const stackCards = ["from-lime-300 to-emerald-500", "from-cyan-300 to-blue-600", "from-violet-300 to-fuchsia-600", "from-amber-200 to-orange-500"].map(
  (g, i) => (
    <div key={g} className={`grid h-64 w-52 place-items-end rounded-2xl bg-gradient-to-br p-4 shadow-2xl ${g}`}>
      <span className="text-4xl font-black text-black/70">0{i + 1}</span>
    </div>
  ),
);

