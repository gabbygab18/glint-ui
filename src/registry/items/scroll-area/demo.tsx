"use client";

import { ScrollArea } from "./scroll-area";

const tags = Array.from({ length: 40 }, (_, i) => `v1.${40 - i}.0`);
const swatches = [
  "from-lime-300 to-emerald-500",
  "from-cyan-300 to-blue-600",
  "from-violet-300 to-fuchsia-600",
  "from-amber-200 to-orange-500",
  "from-rose-300 to-red-600",
  "from-teal-200 to-cyan-600",
  "from-indigo-300 to-violet-700",
  "from-yellow-200 to-lime-500",
];

export default function Demo(p: Record<string, unknown>) {
  return (
    <div className="flex w-full max-w-2xl flex-wrap items-start justify-center gap-6 px-4">
      <ScrollArea {...p} aria-label="Releases" className="h-72 w-52 rounded-2xl border border-border bg-card shadow-xl">
        <div className="p-4">
          <p className="mb-3 text-sm font-semibold text-foreground">Releases</p>
          {tags.map((t) => (
            <div key={t} className="border-b border-border py-2 text-sm text-muted-foreground last:border-0">
              {t}
            </div>
          ))}
        </div>
      </ScrollArea>
      <ScrollArea
        orientation="horizontal"
        type={p.type as "hover" | "scroll" | "always"}
        aria-label="Palettes"
        className="w-80 rounded-2xl border border-border bg-card shadow-xl"
      >
        <div className="flex gap-3 p-4 pb-5">
          {swatches.map((s, i) => (
            <figure key={s} className="w-28 shrink-0">
              <div className={`aspect-[3/4] rounded-xl bg-linear-to-br ${s}`} />
              <figcaption className="mt-2 text-xs text-muted-foreground">Palette {i + 1}</figcaption>
            </figure>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
