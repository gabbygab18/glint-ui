"use client";

import { GlowCursor } from "./glow-cursor";

const cards = [
  { title: "Edge Functions", body: "Run code close to your users in 30+ regions." },
  { title: "Realtime", body: "Broadcast presence and changes over websockets." },
  { title: "Storage", body: "Serve images with on-the-fly transforms." },
];

export default function Demo(p: Record<string, unknown>) {
  return (
    <GlowCursor {...p} className="w-full max-w-3xl rounded-3xl border border-border bg-background/40 p-8 sm:p-10">
      <p className="text-xs font-medium tracking-widest text-muted-foreground uppercase">Platform</p>
      <h2 className="mt-2 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">Everything you need to ship.</h2>
      <div className="mt-8 grid gap-3 sm:grid-cols-3">
        {cards.map((c) => (
          <div key={c.title} data-glow className="rounded-2xl border border-border bg-card/50 p-5 backdrop-blur-md">
            <div className="mb-8 size-8 rounded-lg border border-border bg-muted/60" />
            <h3 className="text-sm font-semibold text-foreground">{c.title}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{c.body}</p>
          </div>
        ))}
      </div>
      <div className="mt-8 flex gap-3">
        <button className="rounded-full bg-primary px-5 py-2 text-sm font-medium text-primary-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring">
          Start building
        </button>
        <button className="rounded-full border border-border px-5 py-2 text-sm font-medium text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring">
          Read the docs
        </button>
      </div>
    </GlowCursor>
  );
}
