"use client";

import { motion } from "motion/react";
import { useRef } from "react";
import { demoImages } from "../../demo-kit";
import { GlassSurface } from "./glass-surface";

const [bg, cover] = [demoImages(8, 1600, 1000)[5], demoImages(4, 200, 200)[3]];

export default function Demo(p: Record<string, unknown>) {
  const stage = useRef<HTMLDivElement>(null);
  return (
    <div ref={stage} className="absolute inset-0 grid place-items-center overflow-hidden">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={bg} alt="" className="absolute inset-0 size-full object-cover brightness-[.6] saturate-150" />
      <p className="pointer-events-none absolute inset-x-0 top-1/2 -translate-y-1/2 select-none text-center text-[18vw] font-black leading-none tracking-tighter text-white/15 [-webkit-text-stroke:2px_rgba(255,255,255,.85)]">
        LIQUID
      </p>
      <motion.div drag dragConstraints={stage} dragElastic={0.15} className="cursor-grab active:cursor-grabbing">
        <GlassSurface className="w-80 p-5" {...p}>
          <div className="flex items-center gap-4 text-white">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={cover} alt="" draggable={false} className="size-16 rounded-2xl object-cover shadow-lg" />
            <div className="min-w-0">
              <p className="text-xs uppercase tracking-widest text-white/70">Now playing</p>
              <p className="truncate text-lg font-semibold">Refraction Dreams</p>
              <p className="truncate text-sm text-white/70">The Glassworks</p>
            </div>
          </div>
          <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-white/25">
            <div className="h-full w-2/5 rounded-full bg-white" />
          </div>
          <p className="mt-3 text-center text-xs text-white/70">Drag me around</p>
        </GlassSurface>
      </motion.div>
    </div>
  );
}
