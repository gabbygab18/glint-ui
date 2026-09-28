"use client";

import { StickerPeel } from "./sticker-peel";

export default function Demo(p: Record<string, unknown>) {
  const radius = (p.radius as number | undefined) ?? 28;
  return (
    <StickerPeel {...p}>
      <div
        className="relative flex size-64 flex-col justify-between overflow-hidden border-[6px] border-white bg-gradient-to-br from-lime-300 via-emerald-400 to-cyan-400 p-5 text-black"
        style={{ borderRadius: radius }}
      >
        <div className="absolute -right-10 -top-10 size-40 rounded-full bg-white/30 blur-2xl" />
        <svg viewBox="0 0 24 24" className="size-10" fill="currentColor" aria-hidden>
          <path d="M12 2l2.6 6.9L22 9.3l-5.8 4.6 2 7.1L12 17l-6.2 4 2-7.1L2 9.3l7.4-.4z" />
        </svg>
        <div>
          <p className="text-4xl font-black uppercase leading-none tracking-tight">Peel
            <br />me</p>
          <p className="mt-2 text-xs font-medium uppercase tracking-[0.2em] text-black/60">Drag the corner</p>
        </div>
      </div>
    </StickerPeel>
  );
}
