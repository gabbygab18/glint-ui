"use client";

import { ArrowRight, Box, Layers, LayoutGrid, MousePointerClick, Smile, Sparkles, Type, Zap } from "@/components/site-icons";
import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import { useState } from "react";

const icons = { type: Type, sparkles: Sparkles, layers: Layers, layout: LayoutGrid, pointer: MousePointerClick, zap: Zap, box: Box, smile: Smile };

export interface ShowcaseCategory {
  id: string;
  label: string;
  icon: keyof typeof icons;
  count: number;
  blurb: string;
  examples: { slug: string; name: string }[];
}

function SideCard({ c, side, onPick }: { c: ShowcaseCategory; side: "left" | "right"; onPick: () => void }) {
  const Icon = icons[c.icon];
  return (
    <button
      type="button"
      onClick={onPick}
      tabIndex={-1}
      aria-hidden
      className={`hidden w-64 shrink-0 rounded-3xl border bg-card p-6 text-left opacity-55 transition-opacity hover:opacity-80 md:block ${
        side === "left" ? "[mask-image:linear-gradient(to_right,transparent,#000_45%)]" : "[mask-image:linear-gradient(to_left,transparent,#000_45%)]"
      }`}
    >
      <span className="grid size-10 place-items-center rounded-xl bg-muted text-muted-foreground">
        <Icon className="size-5" />
      </span>
      <p className="mt-6 font-display text-lg font-bold">{c.label}</p>
      <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{c.blurb}</p>
    </button>
  );
}

/** Category tabs over a row of cards, with the chosen category as the dark center card. */
export function CategoryShowcase({ categories }: { categories: ShowcaseCategory[] }) {
  const [i, setI] = useState(0);
  const n = categories.length;
  const at = (k: number) => categories[(k + n) % n];
  const c = categories[i];
  const Icon = icons[c.icon];

  return (
    <div>
      <div role="tablist" aria-label="Categories" className="mx-auto flex w-fit max-w-full gap-1 overflow-x-auto rounded-full border bg-card p-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {categories.map((cat, k) => {
          const TabIcon = icons[cat.icon];
          const on = k === i;
          return (
            <button
              key={cat.id}
              type="button"
              role="tab"
              aria-selected={on}
              onClick={() => setI(k)}
              className={`relative flex shrink-0 items-center gap-1.5 rounded-full px-3 py-2 text-[13px] transition-colors ${
                on ? "text-white" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {on && <motion.span layoutId="showcase-tab" className="absolute inset-0 -z-0 rounded-full bg-[#141a0f]" transition={{ type: "spring", bounce: 0.2, duration: 0.4 }} />}
              <TabIcon className={`relative size-4 ${on ? "text-[#d9ff6b]" : ""}`} />
              <span className="relative whitespace-nowrap">{cat.label}</span>
            </button>
          );
        })}
      </div>

      <div className="mt-10 flex items-center justify-center gap-5">
        <SideCard c={at(i - 1)} side="left" onPick={() => setI((i - 1 + n) % n)} />

        <div role="tabpanel" aria-label={c.label} className="w-full max-w-sm shrink-0 rounded-[1.75rem] border bg-card p-2 shadow-2xl">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={c.id}
              initial={{ opacity: 0, y: 10, filter: "blur(4px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: -8, filter: "blur(4px)" }}
              transition={{ duration: 0.25 }}
            >
              <div
                className="rounded-[1.35rem] p-6 text-white"
                style={{ background: "radial-gradient(400px circle at 85% 0%, oklch(0.45 0.13 128 / 0.6), transparent 60%), linear-gradient(160deg, oklch(0.24 0.035 128), oklch(0.17 0.02 125))" }}
              >
                <span className="grid size-12 place-items-center rounded-2xl bg-[#d9ff6b] text-[#141a0f] shadow-[0_8px_24px_-8px_#d9ff6b]">
                  <Icon className="size-6" />
                </span>
                <p className="mt-6 font-display text-2xl font-bold">{c.label}</p>
                <p className="mt-2 text-sm leading-relaxed text-white/70">{c.blurb}</p>
                <div className="mt-5 flex flex-wrap gap-1.5">
                  {c.examples.map((e) => (
                    <Link
                      key={e.slug}
                      href={`/components/${e.slug}`}
                      className="rounded-full bg-white/10 px-2.5 py-1 text-xs text-white/85 transition-colors hover:bg-white/20 hover:text-white"
                    >
                      {e.name}
                    </Link>
                  ))}
                </div>
              </div>
              <div className="flex items-center justify-between px-3 pb-1 pt-3">
                <span className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span className="size-2 rounded-full bg-primary" /> {c.count} components
                </span>
                <Link
                  href={`/components/${c.examples[0]?.slug ?? ""}`}
                  className="inline-flex items-center gap-1.5 rounded-full bg-[#141a0f] py-1.5 pl-3.5 pr-1.5 text-xs font-semibold text-white"
                >
                  Explore
                  <span className="grid size-5 place-items-center rounded-full bg-[#d9ff6b] text-[#141a0f]">
                    <ArrowRight className="size-3" />
                  </span>
                </Link>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        <SideCard c={at(i + 1)} side="right" onPick={() => setI((i + 1) % n)} />
      </div>
    </div>
  );
}
