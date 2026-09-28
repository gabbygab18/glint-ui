"use client";

import { useState } from "react";
import { ThemeToggle } from "./theme-toggle";

export default function Demo(p: Record<string, unknown>) {
  const [dark, setDark] = useState<boolean | null>(null);
  const isDark = dark ?? Boolean(p.defaultChecked);
  return (
    <div className="flex flex-col items-center gap-6">
      <ThemeToggle key={String(p.defaultChecked)} {...p} onChange={setDark} />
      <p className="text-sm text-muted-foreground">{isDark ? "Good night" : "Good morning"}</p>
      <div className="flex items-center gap-4">
        <ThemeToggle size={24} label="Dark mode (small)" />
        <ThemeToggle size={32} label="Dark mode (medium)" defaultChecked />
      </div>
    </div>
  );
}
