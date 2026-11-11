"use client";

import { ArrowRight } from "@/components/site-icons";
import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import { useState } from "react";

export interface ShowcaseCategory {
  id: string;
  label: string;
  count: number;
  blurb: string;
  examples: { slug: string; name: string }[];
}

/** Numbered category list on the left; the chosen one fills the big card on the right. */
export function CategoryShowcase({ categories }: { categories: ShowcaseCategory[] }) {
  const [i, setI] = useState(0);
  const c = categories[i];
  const lead = c.examples[0];

  return (
    <div className="grid gap-6 md:grid-cols-[1fr_1.1fr] md:items-center">
      <div role="tablist" aria-label="Categories" aria-orientation="vertical" className="flex flex-col gap-1">
        {categories.map((cat, k) => {
          const on = k === i;
          return (
            <button
              key={cat.id}
              type="button"
              role="tab"
              aria-selected={on}
              onClick={() => setI(k)}
              onKeyDown={(e) => {
                const step = e.key === "ArrowDown" ? 1 : e.key === "ArrowUp" ? -1 : 0;
                if (!step) return;
                e.preventDefault();
                const next = (k + step + categories.length) % categories.length;
                setI(next);
                (e.currentTarget.parentElement?.children[next] as HTMLElement | undefined)?.focus();
              }}
              tabIndex={on ? 0 : -1}
              className={`relative flex items-center gap-3 rounded-xl px-4 py-3 text-left transition-colors ${on ? "text-white" : "hover:bg-foreground/5"}`}
            >
              {on && (
                <motion.span layoutId="category-active" className="btn-ink absolute inset-0 rounded-xl" transition={{ type: "spring", bounce: 0.2, duration: 0.45 }} />
              )}
              <span className="btn-glossy relative grid size-8 shrink-0 place-items-center rounded-full text-xs font-semibold">
                {String(k + 1).padStart(2, "0")}
              </span>
              <span className="relative">
                <span className="block text-sm font-semibold">{cat.label}</span>
                <span className={`block text-xs ${on ? "text-white/70" : "text-muted-foreground"}`}>
                  {cat.examples
                    .slice(0, 3)
                    .map((e) => e.name)
                    .join(" · ")}
                </span>
              </span>
            </button>
          );
        })}
      </div>

      <div role="tabpanel" aria-label={c.label} className="relative h-[460px] overflow-hidden rounded-3xl bg-[#0b0f08]">
        <AnimatePresence initial={false}>
          <motion.div
            key={c.id}
            className="absolute inset-0"
            initial={{ opacity: 0, scale: 1.04 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          >
            {lead && (
              // eslint-disable-next-line @next/next/no-img-element -- static thumbnail
              <img src={`/thumbs/${lead.slug}.webp`} alt="" className="size-full object-cover" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/15 to-transparent" />
            <div className="absolute inset-x-6 bottom-6 text-white">
              <p className="font-display text-5xl font-semibold tracking-tight">{c.count} components</p>
              <p className="mt-2 max-w-sm text-sm text-white/80">{c.blurb}</p>
              <div className="mt-4 flex gap-2">
                {lead && (
                  <Link href={`/components/${lead.slug}`} className="btn-glossy group inline-flex h-9 items-center gap-1.5 rounded-full px-4 text-sm font-semibold">
                    Open {lead.name}
                    <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
                  </Link>
                )}
                <Link href="/components" className="inline-flex h-9 items-center rounded-full px-4 text-sm font-semibold text-white hover:bg-white/15">
                  View all
                </Link>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
