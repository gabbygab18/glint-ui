"use client";

import { Crosshair } from "./crosshair";

export default function Demo(p: Record<string, unknown>) {
  return (
    <Crosshair {...p} className="absolute inset-0 flex flex-col">
      <nav className="flex items-center justify-between px-8 py-6 text-sm">
        <span className="font-mono font-semibold tracking-widest text-foreground">◎ FIELD/01</span>
        <div className="flex gap-6 text-muted-foreground">
          {["Work", "Studio", "Journal", "Contact"].map((l) => (
            <a key={l} href="#" onClick={(e) => e.preventDefault()} className="transition-colors hover:text-foreground">
              {l}
            </a>
          ))}
        </div>
      </nav>
      <div className="grid flex-1 place-items-center px-8 text-center">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-muted-foreground">Precision interfaces</p>
          <h2 className="mt-3 text-6xl font-semibold tracking-tighter text-foreground sm:text-8xl">Crosshair</h2>
          <div className="mt-8 flex justify-center gap-3">
            <button className="rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground">
              Start a project
            </button>
            <button className="rounded-full border border-border px-5 py-2.5 text-sm text-foreground">View work</button>
          </div>
        </div>
      </div>
    </Crosshair>
  );
}
