"use client";

import { demoImages } from "../../demo-kit";
import { InfiniteCanvas } from "./infinite-canvas";

const photos = demoImages(8, 480, 360);

const Photo = ({ i, caption, rotate }: { i: number; caption: string; rotate: number }) => (
  <figure className="w-56 rounded-xl border border-border bg-card p-2 pb-3 shadow-[0_18px_40px_-20px_rgba(0,0,0,.7)]" style={{ rotate: `${rotate}deg` }}>
    {/* eslint-disable-next-line @next/next/no-img-element */}
    <img src={photos[i]} alt={caption} draggable={false} className="aspect-[4/3] w-full rounded-lg object-cover" />
    <figcaption className="mt-2 px-1 text-xs text-muted-foreground">{caption}</figcaption>
  </figure>
);

const Note = ({ text, color, rotate }: { text: string; color: string; rotate: number }) => (
  <div className="w-44 rounded-sm p-4 text-sm leading-snug text-black/80 shadow-[0_14px_30px_-16px_rgba(0,0,0,.7)]" style={{ background: color, rotate: `${rotate}deg` }}>
    {text}
  </div>
);

const items = [
  {
    id: "title",
    x: 0,
    y: -40,
    content: (
      <div className="w-80 rounded-2xl border border-border bg-card/90 p-5 backdrop-blur">
        <p className="text-[11px] uppercase tracking-[.25em] text-muted-foreground">Brand refresh · Q3</p>
        <p className="mt-2 text-2xl font-semibold tracking-tight text-foreground">Northern Light moodboard</p>
        <p className="mt-2 text-sm text-muted-foreground">Calm, cold palettes with one warm accent. Drag around to explore.</p>
        <div className="mt-4 flex -space-x-2">
          {demoImages(4, 64, 64).map((a) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img key={a} src={a} alt="" draggable={false} className="size-7 rounded-full object-cover ring-2 ring-card" />
          ))}
        </div>
      </div>
    ),
  },
  { id: "p1", x: -330, y: -190, content: <Photo i={0} caption="Harbour at 5am" rotate={-3} /> },
  { id: "p2", x: 350, y: -170, content: <Photo i={1} caption="Texture: weathered pine" rotate={2.5} /> },
  { id: "p3", x: -360, y: 170, content: <Photo i={2} caption="Snowfield, soft contrast" rotate={2} /> },
  { id: "p4", x: 330, y: 190, content: <Photo i={3} caption="Night market glow" rotate={-2} /> },
  { id: "p5", x: -720, y: -20, content: <Photo i={4} caption="Fjord reflections" rotate={-1.5} /> },
  { id: "p6", x: 720, y: 10, content: <Photo i={5} caption="Wool & linen" rotate={3} /> },
  { id: "p7", x: 20, y: 420, content: <Photo i={6} caption="Copper details" rotate={-2.5} /> },
  { id: "p8", x: -20, y: -470, content: <Photo i={7} caption="Coastline, overcast" rotate={1.5} /> },
  { id: "n1", x: -40, y: 170, content: <Note text="Accent = copper #D9824B, use sparingly" color="#fde68a" rotate={-4} /> },
  { id: "n2", x: 560, y: -360, content: <Note text="Headlines in a tight grotesk, body at 16/26" color="#fbcfe8" rotate={3} /> },
  { id: "n3", x: -600, y: 360, content: <Note text="Ask Leo for the raw harbour shots" color="#bbf7d0" rotate={2} /> },
  {
    id: "palette",
    x: 640,
    y: 380,
    content: (
      <div className="flex gap-1.5 rounded-2xl border border-border bg-card p-3">
        {["#0f172a", "#334155", "#94a3b8", "#e2e8f0", "#d9824b"].map((c) => (
          <div key={c} className="text-center">
            <div className="h-16 w-12 rounded-lg" style={{ background: c }} />
            <p className="mt-1 font-mono text-[9px] text-muted-foreground">{c}</p>
          </div>
        ))}
      </div>
    ),
  },
  {
    id: "type",
    x: -640,
    y: -380,
    content: (
      <div className="w-52 rounded-2xl border border-border bg-card p-4">
        <p className="text-6xl font-semibold tracking-tighter text-foreground">Aa</p>
        <p className="mt-2 text-xs text-muted-foreground">Display · 600 · −3% tracking</p>
      </div>
    ),
  },
];

export default function Demo(p: Record<string, unknown>) {
  return (
    <div className="absolute inset-0">
      <InfiniteCanvas items={items} {...p} />
      <p className="pointer-events-none absolute bottom-5 left-5 rounded-lg border border-border bg-card/80 px-2.5 py-1.5 text-xs text-muted-foreground backdrop-blur">
        Drag to pan · Scroll to zoom
      </p>
    </div>
  );
}
