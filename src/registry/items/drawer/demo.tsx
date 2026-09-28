"use client";

import { useState } from "react";
import { SlidersHorizontal } from "lucide-react";
import { Drawer, DrawerClose, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle, DrawerTrigger } from "./drawer";

const tags = ["Remote", "Full-time", "Contract", "Design", "Engineering", "Senior", "EU timezone", "Equity"];

export default function Demo({ snapPoints, ...p }: Record<string, unknown>) {
  const [on, setOn] = useState(["Remote", "Design"]);
  const snaps = String(snapPoints ?? "")
    .split(",")
    .map(Number)
    .filter((n) => n > 0 && n <= 1);

  return (
    // Rendered open and contained so the preview stage shows it; users get a true modal sheet by default.
    <div className="absolute inset-0 grid place-items-center">
      <Drawer key={snaps.join()} {...p} defaultOpen position="absolute" snapPoints={snaps.length ? snaps : undefined}>
        <DrawerTrigger>
          <SlidersHorizontal /> Filters
        </DrawerTrigger>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Filters</DrawerTitle>
            <DrawerDescription>Drag the sheet down to dismiss, or snap it to half height.</DrawerDescription>
          </DrawerHeader>
          <div className="flex flex-wrap gap-2">
            {tags.map((t) => {
              const active = on.includes(t);
              return (
                <button
                  key={t}
                  type="button"
                  aria-pressed={active}
                  onClick={() => setOn((v) => (active ? v.filter((x) => x !== t) : [...v, t]))}
                  className={
                    "h-8 rounded-full border px-3 text-sm outline-none transition-[background-color,border-color,color,scale] focus-visible:ring-2 focus-visible:ring-ring/60 active:scale-95 " +
                    (active ? "border-primary bg-primary text-primary-foreground" : "border-border bg-background text-foreground hover:bg-muted")
                  }
                >
                  {t}
                </button>
              );
            })}
          </div>
          <label className="mt-5 grid gap-2 text-sm font-medium text-foreground">
            Minimum salary
            <input type="range" min={40} max={200} defaultValue={90} className="accent-primary" />
          </label>
          <DrawerFooter>
            <DrawerClose>Reset</DrawerClose>
            <DrawerClose className="border-transparent bg-primary text-primary-foreground hover:bg-primary/90">Show 128 jobs</DrawerClose>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </div>
  );
}
