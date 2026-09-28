"use client";

import Link from "next/link";
import { useState } from "react";
import { CATEGORIES, registry, type Category, type RegistryEntry } from "@/registry";
import { useStats } from "@/lib/stats";
import { Search as SearchIcon } from "lucide-react";
import { Badge } from "@/registry/items/badge/badge";
import { Button } from "@/registry/items/button/button";
import { Input } from "@/registry/items/input/input";
import { Select } from "@/registry/items/select/select";

const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
const letterOf = (e: RegistryEntry) => e.name[0].toUpperCase();

export function ComponentGrid() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<Category | "all">("all");
  const [sort, setSort] = useState<"az" | "popular">("az");
  const stats = useStats();

  const q = query.trim().toLowerCase();
  const popularity = (e: RegistryEntry) => (stats?.[e.slug]?.views ?? 0) + (stats?.[e.slug]?.copies ?? 0) * 5;
  const entries = registry
    .filter((e) => (category === "all" || e.category === category) && (!q || `${e.name} ${e.description}`.toLowerCase().includes(q)))
    .sort((a, b) => (sort === "popular" ? popularity(b) - popularity(a) : a.name.localeCompare(b.name)));

  const reset = () => {
    setQuery("");
    setCategory("all");
  };

  // First card of each letter gets an anchor for the quick-nav rail.
  const seen = new Set<string>();

  return (
    <div>
      <div className="mb-4 flex flex-col gap-3 sm:flex-row">
        <Input
          type="search"
          size="lg"
          startIcon={<SearchIcon />}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={`Search ${registry.length} components…`}
          aria-label="Filter components"
          spellCheck={false}
          className="flex-1"
        />
        <Select
          value={sort}
          onValueChange={(v) => setSort(v as typeof sort)}
          aria-label="Sort"
          options={[
            { value: "az", label: "A–Z" },
            { value: "popular", label: "Most popular" },
          ]}
          className="sm:w-48"
        />
      </div>

      <div role="group" aria-label="Category" className="mb-8 flex flex-wrap gap-2">
        {[{ id: "all" as const, label: "All" }, ...CATEGORIES].map((c) => {
          const count = c.id === "all" ? registry.length : registry.filter((e) => e.category === c.id).length;
          if (!count) return null;
          const on = category === c.id;
          return (
            <Button
              key={c.id}
              size="sm"
              variant={on ? "default" : "outline"}
              aria-pressed={on}
              onClick={() => setCategory(c.id)}
              className="rounded-full"
            >
              {c.label} <span className="opacity-60">{count}</span>
            </Button>
          );
        })}
      </div>

      {entries.length === 0 ? (
        <div className="rounded-3xl border border-dashed py-20 text-center">
          <p className="font-display text-lg font-semibold">Nothing matches “{query}”.</p>
          <Button variant="link" onClick={reset} className="mt-2">
            Clear filters
          </Button>
        </div>
      ) : (
        <ul className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {entries.map((e) => {
            const l = letterOf(e);
            const anchor = sort === "az" && !seen.has(l) ? `letter-${l}` : undefined;
            seen.add(l);
            return (
              <li key={e.slug} id={anchor} className="scroll-mt-24">
                <Card entry={e} />
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

function Card({ entry: e }: { entry: RegistryEntry }) {
  const [broken, setBroken] = useState(false);
  return (
    <Link
      href={`/components/${e.slug}`}
      className="group block overflow-hidden rounded-3xl border bg-card transition-all hover:-translate-y-0.5 hover:border-foreground/20 hover:shadow-xl hover:shadow-black/5"
    >
      <div className="relative aspect-[16/10] overflow-hidden bg-[oklch(0.12_0.004_110)]">
        {broken ? (
          <div className="grid size-full place-items-center bg-[radial-gradient(circle_at_30%_20%,color-mix(in_oklch,var(--primary)_25%,transparent),transparent_60%)] p-6 text-center">
            <span className="font-display text-3xl font-bold text-white/80">{e.name}</span>
          </div>
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={`/thumbs/${e.slug}.webp`}
            alt=""
            loading="lazy"
            decoding="async"
            onError={() => setBroken(true)}
            // The error can fire before hydration attaches onError; catch that case too.
            ref={(img) => {
              if (img?.complete && !img.naturalWidth) setBroken(true);
            }}
            className="size-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          />
        )}
        {e.isNew && (
          <Badge size="sm" shine className="absolute left-3 top-3">
            New
          </Badge>
        )}
      </div>
      <div className="p-5">
        <h3 className="font-display text-lg font-bold underline-offset-4 group-hover:underline">{e.name}</h3>
        <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{e.description}</p>
      </div>
    </Link>
  );
}

export function QuickNav() {
  const available = new Set(registry.map(letterOf));
  return (
    <div className="grid grid-cols-7 gap-1 text-sm">
      {LETTERS.map((l) =>
        available.has(l) ? (
          <a key={l} href={`#letter-${l}`} className="grid h-8 place-items-center rounded-md font-medium hover:bg-muted">
            {l}
          </a>
        ) : (
          <span key={l} aria-hidden className="grid h-8 place-items-center text-muted-foreground/40">
            {l}
          </span>
        ),
      )}
    </div>
  );
}
