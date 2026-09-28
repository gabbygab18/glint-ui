"use client";

import { Camera, Flashlight, Lock } from "lucide-react";
import { IphoneMockup } from "./iphone-mockup";

const notes = [
  { app: "Messages", when: "now", title: "Maya", body: "Landing at 6:20, dinner still on? 🍜", tint: "bg-emerald-500" },
  { app: "Calendar", when: "9m ago", title: "Design review", body: "10:30 – 11:00 · Studio B", tint: "bg-rose-500" },
];

function LockScreen() {
  return (
    <div
      className="relative size-full text-white"
      style={{
        background:
          "radial-gradient(120% 70% at 15% 5%, #fb923c 0%, transparent 55%), radial-gradient(110% 80% at 95% 45%, #7c3aed 0%, transparent 60%), radial-gradient(100% 60% at 20% 100%, #0ea5e9 0%, transparent 65%), #0b1020",
      }}
    >
      <div className="flex flex-col items-center pt-14">
        <Lock className="size-3.5 opacity-80" aria-hidden />
        <p className="mt-2 text-[13px] font-medium opacity-85">Friday, September 27</p>
        <p className="text-[76px] leading-none font-semibold tracking-tight opacity-95" style={{ fontFeatureSettings: '"tnum"' }}>
          9:41
        </p>
      </div>
      <div className="absolute inset-x-2.5 bottom-24 flex flex-col gap-2">
        {notes.map((n) => (
          <div key={n.app} className="flex gap-2.5 rounded-[18px] bg-white/20 p-2.5 backdrop-blur-xl">
            <span className={`mt-0.5 size-8 shrink-0 rounded-[9px] ${n.tint}`} />
            <div className="min-w-0 flex-1 text-[12px] leading-snug">
              <div className="flex justify-between">
                <span className="font-semibold">{n.title}</span>
                <span className="opacity-60">{n.when}</span>
              </div>
              <p className="truncate opacity-90">{n.body}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="absolute inset-x-8 bottom-9 flex justify-between">
        {[Flashlight, Camera].map((Icon, i) => (
          <span key={i} className="grid size-11 place-items-center rounded-full bg-black/25 backdrop-blur-md">
            <Icon className="size-5" aria-hidden />
          </span>
        ))}
      </div>
    </div>
  );
}

export default function Demo(p: Record<string, unknown>) {
  return (
    <div className="py-8">
      <IphoneMockup {...p}>
        <LockScreen />
      </IphoneMockup>
    </div>
  );
}
