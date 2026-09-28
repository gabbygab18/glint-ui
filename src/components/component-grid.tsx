"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { CATEGORIES, registry, type Category, type RegistryEntry } from "@/registry";
import { useStats } from "@/lib/stats";
import { Search as SearchIcon } from "lucide-react";
import { Badge } from "@/registry/items/badge/badge";
import { Button } from "@/registry/items/button/button";
import { Input } from "@/registry/items/input/input";
import { Pagination } from "@/registry/items/pagination/pagination";
import { Select } from "@/registry/items/select/select";

const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
const letterOf = (e: RegistryEntry) => e.name[0].toUpperCase();
const PAGE_SIZE = 24; // divisible by 1, 2 and 3 columns
const LETTER_EVENT = "glint:letter";

export function ComponentGrid() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<Category | "all">("all");
  const [sort, setSort] = useState<"az" | "popular">("az");
  const [page, setPage] = useState(1);
  const [jumpTo, setJumpTo] = useState<string | null>(null);
  const top = useRef<HTMLDivElement>(null);
  const stats = useStats();

  const q = query.trim().toLowerCase();
  const popularity = (e: RegistryEntry) => (stats?.[e.slug]?.views ?? 0) + (stats?.[e.slug]?.copies ?? 0) * 5;
  const entries = registry
    .filter(
      (e) =>
        (category === "all" || e.category === category) &&
        (!q || `${e.name} ${e.description}`.toLowerCase().includes(q)),
    )
    .sort((a, b) => (sort === "popular" ? popularity(b) - popularity(a) : a.name.localeCompare(b.name)));

  const pages = Math.max(1, Math.ceil(entries.length / PAGE_SIZE));
  const current = Math.min(page, pages);
  const visible = entries.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE);

  const reset = () => {
    setQuery("");
    setCategory("all");
    setPage(1);
  };

  const goTo = (p: number) => {
    setPage(p);
    top.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  // Quick-nav letters: switch to A–Z, clear filters and open the page that holds the letter.
  useEffect(() => {
    const onLetter = (e: Event) => {
      const letter = (e as CustomEvent<string>).detail;
      const all = [...registry].sort((a, b) => a.name.localeCompare(b.name));
      const index = all.findIndex((x) => letterOf(x) === letter);
      if (index < 0) return;
      setQuery("");
      setCategory("all");
      setSort("az");
      setPage(Math.floor(index / PAGE_SIZE) + 1);
      setJumpTo(letter);
    };
    window.addEventListener(LETTER_EVENT, onLetter);
    return () => window.removeEventListener(LETTER_EVENT, onLetter);
  }, []);

  // Scroll once the page holding the letter has rendered.
  useEffect(() => {
    if (!jumpTo) return;
    document.getElementById(`letter-${jumpTo}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
    setJumpTo(null); // eslint-disable-line react-hooks/set-state-in-effect -- one-shot scroll request
  }, [jumpTo, current]);

  // First card of each letter gets an anchor for the quick-nav rail.
  const seen = new Set<string>();

  return (
    <div ref={top} className="scroll-mt-24">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row">
        <Input
          type="search"
          size="lg"
          startIcon={<SearchIcon />}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setPage(1);
          }}
          placeholder={`Search ${registry.length} components…`}
          aria-label="Filter components"
          spellCheck={false}
          className="flex-1"
        />
        <Select
          value={sort}
          onValueChange={(v) => {
            setSort(v as typeof sort);
            setPage(1);
          }}
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
              onClick={() => {
                setCategory(c.id);
                setPage(1);
              }}
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
        <>
          <ul className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {visible.map((e) => {
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
          <div className="mt-10 flex flex-col items-center gap-3">
            {pages > 1 && <Pagination total={pages} page={current} onPageChange={goTo} />}
            <p className="text-sm text-muted-foreground">
              {(current - 1) * PAGE_SIZE + 1}–{Math.min(current * PAGE_SIZE, entries.length)} of {entries.length}
            </p>
          </div>
        </>
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
          <a
            key={l}
            href={`#letter-${l}`}
            onClick={(e) => {
              e.preventDefault();
              window.dispatchEvent(new CustomEvent(LETTER_EVENT, { detail: l }));
            }}
            className="grid h-8 place-items-center rounded-md font-medium hover:bg-muted"
          >
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
