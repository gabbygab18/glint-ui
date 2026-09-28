"use client";

import { Image as ImageIcon, MousePointerClick, Sparkles, Square, Type } from "lucide-react";
import { demoImages } from "../../demo-kit";
import { LayerStack } from "./layer-stack";

const [photo] = demoImages(1, 300, 300);

const layers = [
  {
    label: "Effects",
    icon: <Sparkles />,
    content: (
      <div className="size-full" style={{ background: "radial-gradient(circle at 78% 22%, rgba(190,242,100,.45), transparent 32%), radial-gradient(circle at 20% 90%, rgba(34,211,238,.3), transparent 30%)" }} />
    ),
  },
  {
    label: "Button",
    icon: <MousePointerClick />,
    content: (
      <div className="flex size-full items-end p-4">
        <span className="rounded-full bg-lime-300 px-3.5 py-1.5 text-[11px] font-semibold text-black shadow-lg">Get started</span>
      </div>
    ),
  },
  {
    label: "Headline",
    icon: <Type />,
    content: (
      <div className="flex size-full flex-col gap-1.5 p-4">
        <span className="text-[10px] font-medium tracking-[0.2em] text-lime-200 uppercase">New</span>
        <span className="max-w-[9rem] text-lg leading-tight font-semibold text-white">Design at the speed of thought</span>
        <span className="mt-1 h-1.5 w-24 rounded-full bg-white/30" />
        <span className="h-1.5 w-16 rounded-full bg-white/20" />
      </div>
    ),
  },
  {
    label: "Image",
    icon: <ImageIcon />,
    content: (
      <div className="flex size-full items-center justify-end p-4">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={photo} alt="" className="h-full w-[42%] rounded-xl object-cover shadow-2xl" />
      </div>
    ),
  },
  {
    label: "Background",
    icon: <Square />,
    content: <div className="size-full bg-gradient-to-br from-indigo-600/80 via-violet-700/70 to-slate-900/80" />,
  },
];

export default function Demo(p: Record<string, unknown>) {
  return <LayerStack layers={layers} {...p} />;
}
