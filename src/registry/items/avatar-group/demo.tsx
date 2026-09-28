"use client";

import { AvatarGroup } from "./avatar-group";

const people = [
  { name: "Maya Chen", src: "https://i.pravatar.cc/160?img=47" },
  { name: "Jonas Weber", src: "https://i.pravatar.cc/160?img=12" },
  { name: "Priya Raman", src: "https://i.pravatar.cc/160?img=45" },
  { name: "Leo Martins" },
  { name: "Aiko Tanaka", src: "https://i.pravatar.cc/160?img=32" },
  { name: "Samuel Okafor", src: "https://i.pravatar.cc/160?img=59" },
  { name: "Clara Nilsson", src: "https://i.pravatar.cc/160?img=25" },
];

export default function Demo(p: Record<string, unknown>) {
  return (
    <div className="flex w-full max-w-lg items-center justify-between gap-6 rounded-2xl border border-border bg-card p-5 shadow-xl">
      <div className="shrink-0">
        <p className="text-sm font-semibold text-foreground">Design review</p>
        <p className="text-xs text-muted-foreground">Today, 3:00 PM · 7 attending</p>
      </div>
      <AvatarGroup people={people} {...p} />
    </div>
  );
}
