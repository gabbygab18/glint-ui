"use client";

import { Atom, Flame, Globe, Rocket, Server, Triangle } from "lucide-react";
import { Select } from "./select";

const frameworks = [
  {
    label: "Frontend",
    options: [
      { value: "next", label: "Next.js", icon: <Triangle /> },
      { value: "remix", label: "React Router", icon: <Atom /> },
      { value: "astro", label: "Astro", icon: <Rocket /> },
    ],
  },
  {
    label: "Backend",
    options: [
      { value: "hono", label: "Hono", icon: <Flame /> },
      { value: "express", label: "Express", icon: <Server />, disabled: true },
    ],
  },
];

const regions = ["Frankfurt", "Singapore", "Sao Paulo", "Virginia", "Oregon", "Tokyo"].map((r) => ({
  value: r.toLowerCase().replace(" ", "-"),
  label: r,
  icon: <Globe />,
}));

export default function Demo(p: Record<string, unknown>) {
  return (
    <form className="grid w-full max-w-sm gap-4 rounded-2xl border border-border bg-card p-5 shadow-xl" onSubmit={(e) => e.preventDefault()}>
      <div className="grid gap-1.5">
        <label htmlFor="demo-framework" className="text-sm font-medium text-foreground">
          Framework
        </label>
        {/* Open on load so the preview shows the listbox. */}
        <Select id="demo-framework" name="framework" options={frameworks} defaultValue="next" className="max-w-none" {...p} defaultOpen />
      </div>
      <div className="grid gap-1.5">
        <label htmlFor="demo-region" className="text-sm font-medium text-foreground">
          Region
        </label>
        <Select id="demo-region" name="region" options={regions} placeholder="Choose a region" className="max-w-none" />
      </div>
      <button className="h-10 rounded-lg bg-primary text-sm font-medium text-primary-foreground outline-none transition-colors hover:bg-primary/90 focus-visible:ring-2 focus-visible:ring-ring/60">
        Deploy
      </button>
    </form>
  );
}
