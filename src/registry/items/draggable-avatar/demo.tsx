"use client";

import { Mic, PhoneOff, Video } from "lucide-react";
import { demoImages } from "../../demo-kit";
import { DraggableAvatar } from "./draggable-avatar";

const scene = demoImages(40, 1200, 800)[28];
const me = demoImages(12, 200, 200)[3];

export default function Demo(p: Record<string, unknown>) {
  return (
    <div className="relative h-[24rem] w-full max-w-3xl overflow-hidden rounded-3xl border border-border bg-muted shadow-2xl">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={scene} alt="" className="absolute inset-0 size-full object-cover" />
      <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/60" />

      <div className="absolute left-5 top-5 flex items-center gap-2 rounded-full bg-black/40 px-3 py-1.5 text-xs font-medium text-white backdrop-blur-md">
        <span className="size-2 animate-pulse rounded-full bg-rose-500" />
        Lena Hartmann · 12:48
      </div>

      <div className="absolute bottom-5 left-1/2 flex -translate-x-1/2 items-center gap-3 rounded-full bg-black/40 p-2 backdrop-blur-md">
        {[
          { label: "Mute", Icon: Mic, cls: "bg-white/15 hover:bg-white/25" },
          { label: "Stop video", Icon: Video, cls: "bg-white/15 hover:bg-white/25" },
          { label: "End call", Icon: PhoneOff, cls: "bg-rose-500 hover:bg-rose-600" },
        ].map(({ label, Icon, cls }) => (
          <button
            key={label}
            type="button"
            aria-label={label}
            className={`grid size-10 place-items-center rounded-full text-white transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white ${cls}`}
          >
            <Icon className="size-4" aria-hidden />
          </button>
        ))}
      </div>

      <DraggableAvatar key={String(p.corner)} src={me} {...p} />
    </div>
  );
}
