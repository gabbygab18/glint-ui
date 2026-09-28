"use client";

import { PillNav } from "./pill-nav";

const items = [
  { label: "Home", href: "#home" },
  { label: "Work", href: "#work" },
  { label: "Studio", href: "#studio" },
  { label: "Journal", href: "#journal" },
  { label: "Contact", href: "#contact" },
];

export default function Demo(p: Record<string, unknown>) {
  return (
    <div className="absolute inset-0 flex flex-col items-center px-4 pt-8">
      <PillNav
        items={items}
        logo={<span className="text-sm font-black tracking-tight">nº</span>}
        {...p}
        className="z-10 max-w-2xl"
      />
      <div className="pointer-events-none mt-auto mb-auto text-center">
        <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Independent design studio</p>
        <p className="mt-3 text-4xl font-semibold tracking-tight text-foreground sm:text-6xl">Hover the pills</p>
      </div>
    </div>
  );
}
