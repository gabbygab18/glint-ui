"use client";
/* eslint-disable @next/next/no-img-element */

import { useRef } from "react";
import { demoImages } from "../../demo-kit";
import { ScrollStack } from "./scroll-stack";

const images = demoImages(5, 520, 520);
const cards = [
  { tag: "01 · Strategy", title: "Find the one idea worth building", body: "Workshops, interviews and a sharp brief before a single pixel moves.", tone: "#c6ff3d", ink: "#0a0a0a" },
  { tag: "02 · Identity", title: "A brand that sounds like you", body: "Naming, logo systems and a voice guide your whole team can use.", tone: "#8b5cf6", ink: "#ffffff" },
  { tag: "03 · Product", title: "Interfaces people love to touch", body: "Prototypes, motion and design systems built for real engineers.", tone: "#0ea5e9", ink: "#ffffff" },
  { tag: "04 · Build", title: "Ship fast, then keep shipping", body: "Next.js, edge rendering and CI that keeps every release boring.", tone: "#f97316", ink: "#0a0a0a" },
  { tag: "05 · Growth", title: "Measure what actually matters", body: "Analytics, experiments and a weekly loop that compounds.", tone: "#f472b6", ink: "#0a0a0a" },
];

export default function Demo(p: Record<string, unknown>) {
  const box = useRef<HTMLDivElement>(null);
  return (
    <div
      ref={box}
      className="relative h-[26rem] w-full max-w-2xl overflow-y-auto overscroll-contain rounded-2xl border border-border bg-background/40 px-5 [scrollbar-width:thin] sm:px-8"
    >
      <div className="flex h-44 flex-col items-center justify-end gap-2 pb-8 text-center">
        <p className="text-2xl font-semibold tracking-tight text-foreground">How we work</p>
        <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Scroll inside ↓</p>
      </div>
      <ScrollStack {...p} scrollContainerRef={box} itemClassName="shadow-[0_-12px_40px_-12px_rgba(0,0,0,.6)]">
        {cards.map((c, i) => (
          <div key={c.tag} className="grid h-64 grid-cols-[1fr_auto] gap-5 p-5 sm:p-6" style={{ background: c.tone, color: c.ink }}>
            <div className="flex flex-col justify-between">
              <span className="text-xs font-semibold uppercase tracking-[0.2em] opacity-70">{c.tag}</span>
              <div>
                <h3 className="text-2xl font-semibold leading-tight tracking-tight sm:text-3xl">{c.title}</h3>
                <p className="mt-2 max-w-xs text-sm opacity-75">{c.body}</p>
              </div>
            </div>
            <img src={images[i]} alt="" className="hidden h-full w-44 rounded-2xl object-cover sm:block" />
          </div>
        ))}
      </ScrollStack>
      <p className="pb-24 pt-6 text-center text-sm text-muted-foreground">That&apos;s the whole process.</p>
    </div>
  );
}
