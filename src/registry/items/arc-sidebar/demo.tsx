"use client";

import { useState } from "react";
import { FlaskConical, Map, Menu, Package, Palette, Rocket, Ruler, Sparkles, Type } from "lucide-react";
import { ArcSidebar, type SidebarSection } from "./arc-sidebar";

// Three sections, three inks: jump between them and the marker crossfades on the way.
const SAMPLE: SidebarSection[] = [
  {
    label: "Getting started",
    items: [
      { label: "Overview", icon: <Sparkles /> },
      { label: "Quick start", icon: <Rocket /> },
      { label: "Install", icon: <Package /> },
    ],
  },
  {
    label: "Foundations",
    color: "#7aa2ff",
    items: [
      { label: "Colour", icon: <Palette /> },
      { label: "Type scale", icon: <Type /> },
      { label: "Spacing", icon: <Ruler /> },
    ],
  },
  {
    label: "Reference",
    color: "#a78bfa",
    items: [
      { label: "Recipes", icon: <FlaskConical /> },
      { label: "Changelog", badge: "New" },
      { label: "Roadmap", icon: <Map />, disabled: true },
    ],
  },
];

export default function Demo(p: Record<string, unknown>) {
  const [active, setActive] = useState(4);
  const [open, setOpen] = useState(false);

  return (
    <div className="relative flex h-[25rem] w-[38rem] max-w-[calc(100%-2rem)] overflow-hidden rounded-2xl border border-border bg-background">
      <ArcSidebar
        navLabel="Sample navigation"
        {...p}
        sections={SAMPLE}
        value={active}
        onChange={(index) => setActive(index)}
        className="h-full w-56 shrink-0 border-r border-border pr-3 pl-7"
      />

      <div className="flex min-w-0 flex-1 flex-col gap-3 p-6">
        <p className="text-lg font-semibold text-foreground">{SAMPLE.flatMap((s) => s.items)[active]?.label}</p>
        <p className="max-w-xs text-xs leading-relaxed text-muted-foreground">
          Pick a row and the marker arcs to it, arriving in the colour of the section it lands in. The drawer is the same
          panel again, over the page.
        </p>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="mt-auto inline-flex w-fit cursor-pointer items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-xs font-semibold text-foreground transition-colors hover:bg-muted"
        >
          <Menu className="size-3.5" />
          Open the drawer
        </button>
      </div>

      <ArcSidebar
        navLabel="Sample navigation"
        {...p}
        sections={SAMPLE}
        value={active}
        variant="drawer"
        position="absolute"
        open={open}
        onOpenChange={setOpen}
        onChange={(index) => {
          setActive(index);
          setOpen(false);
        }}
      />
    </div>
  );
}
