"use client";

import { GlareHover } from "./glare-hover";

export default function Demo(p: Record<string, unknown>) {
  return (
    <div className="flex flex-col items-center gap-5">
      <GlareHover {...p} className="rounded-3xl shadow-2xl shadow-black/50">
        <div className="relative flex aspect-[1.586] w-[min(22rem,80vw)] flex-col justify-between overflow-hidden rounded-3xl border border-white/10 bg-[radial-gradient(120%_120%_at_0%_0%,#3b3f2a_0%,#16170f_45%,#0a0a0a_100%)] p-6 text-white">
          <div className="flex items-start justify-between">
            <span className="text-sm font-semibold tracking-[0.2em]">GLINT</span>
            <span className="rounded-full bg-[#c6ff3d] px-2.5 py-0.5 text-[10px] font-bold text-black">BLACK</span>
          </div>
          <div className="h-9 w-12 rounded-md bg-gradient-to-br from-amber-200 via-yellow-500 to-amber-700 opacity-90" />
          <div>
            <p className="font-mono text-lg tracking-[0.18em]">4829 •••• •••• 2031</p>
            <div className="mt-2 flex justify-between font-mono text-[11px] uppercase tracking-widest text-white/60">
              <span>Ana Reyes</span>
              <span>09 / 29</span>
            </div>
          </div>
        </div>
      </GlareHover>
      <p className="text-xs text-muted-foreground">Hover the card</p>
    </div>
  );
}
