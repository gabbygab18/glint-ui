"use client";

import { useEffect, useState } from "react";
import { PageTransition } from "./page-transition";

const views = [
  {
    id: "Work",
    eyebrow: "Selected work",
    title: "Interfaces with a pulse.",
    body: "Product design and front-end craft for teams that care about the last 5%.",
    tint: "from-lime-300/25",
  },
  {
    id: "Studio",
    eyebrow: "The studio",
    title: "Small team, sharp tools.",
    body: "Four people, one long table, and a strong opinion about easing curves.",
    tint: "from-cyan-300/25",
  },
  {
    id: "Contact",
    eyebrow: "Say hello",
    title: "Let's build the next one.",
    body: "hello@studio.dev. We reply within a day, usually with sketches.",
    tint: "from-violet-400/25",
  },
];

export default function Demo(p: Record<string, unknown>) {
  const [tab, setTab] = useState(0);
  const [auto, setAuto] = useState(true);
  useEffect(() => {
    if (!auto) return;
    const id = setInterval(() => setTab((t) => (t + 1) % views.length), 3200);
    return () => clearInterval(id);
  }, [auto]);
  const v = views[tab];

  return (
    <div className="w-full max-w-2xl">
      <div role="tablist" aria-label="Sections" className="mb-3 flex gap-1 rounded-full border border-border bg-card p-1">
        {views.map((x, i) => (
          <button
            key={x.id}
            role="tab"
            aria-selected={i === tab}
            onClick={() => {
              setAuto(false);
              setTab(i);
            }}
            className={`flex-1 rounded-full px-4 py-1.5 text-sm font-medium outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring ${
              i === tab ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {x.id}
          </button>
        ))}
      </div>
      <PageTransition transitionKey={v.id} {...p} className="h-80 rounded-3xl border border-border bg-card">
        <section className={`flex size-full flex-col justify-end bg-gradient-to-br ${v.tint} to-transparent p-8`}>
          <p className="text-xs font-medium tracking-widest text-muted-foreground uppercase">{v.eyebrow}</p>
          <h2 className="mt-2 text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">{v.title}</h2>
          <p className="mt-3 max-w-md text-sm text-muted-foreground">{v.body}</p>
        </section>
      </PageTransition>
    </div>
  );
}
