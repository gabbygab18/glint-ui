"use client";

import { useState } from "react";
import { BookOpen, Home, Layers, Sparkles } from "lucide-react";
import { GooeyNav, type GooeyNavItem } from "./gooey-nav";

const ITEMS: GooeyNavItem[] = [
  { label: "Home", icon: <Home /> },
  { label: "Components", icon: <Layers /> },
  { label: "Templates", icon: <Sparkles /> },
  { label: "Docs", icon: <BookOpen /> },
];

export default function Demo(p: Record<string, unknown>) {
  const [active, setActive] = useState(1);
  return (
    <div className="flex flex-col items-center gap-5 px-4">
      <GooeyNav {...p} items={ITEMS} value={active} onChange={setActive} />
      <p className="text-[11px] font-medium tracking-wide text-muted-foreground uppercase">Tap a tab to pull the pill out</p>
    </div>
  );
}
