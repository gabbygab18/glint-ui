"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { categoryLabel, registry } from "@/registry";
import { Search as SearchIcon } from "lucide-react";
import { Button } from "@/registry/items/button/button";
import { Input } from "@/registry/items/input/input";
import { Kbd, KbdGroup } from "@/registry/items/kbd/kbd";
import { ScrollArea } from "@/registry/items/scroll-area/scroll-area";

export function Search() {
  const dialog = useRef<HTMLDialogElement>(null);
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);

  const q = query.trim().toLowerCase();
  const results = registry.filter(
    (e) => !q || e.name.toLowerCase().includes(q) || e.description.toLowerCase().includes(q) || e.category.includes(q),
  );

  const open = () => {
    setQuery("");
    setActive(0);
    dialog.current?.showModal();
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        open();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const go = (slug: string) => {
    dialog.current?.close();
    router.push(`/components/${slug}`);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") setActive((a) => Math.min(a + 1, results.length - 1));
    else if (e.key === "ArrowUp") setActive((a) => Math.max(a - 1, 0));
    else if (e.key === "Enter" && results[active]) go(results[active].slug);
    else return;
    e.preventDefault();
  };

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={open}
        startIcon={<SearchIcon />}
        className="rounded-full text-muted-foreground hover:text-foreground max-sm:hidden sm:w-60 sm:justify-start"
      >
        <span className="hidden sm:inline">Search components</span>
        <span className="sr-only sm:hidden">Search</span>
        <KbdGroup className="ml-auto hidden sm:inline-flex">
          <Kbd size="sm" listen={false}>
            Ctrl
          </Kbd>
          <Kbd size="sm" listen={false}>
            K
          </Kbd>
        </KbdGroup>
      </Button>

      <dialog
        ref={dialog}
        aria-label="Search components"
        onClick={(e) => e.target === dialog.current && dialog.current.close()}
        className="m-auto mt-[12vh] w-[min(36rem,calc(100vw-2rem))] rounded-2xl border border-border bg-card p-0 text-foreground shadow-2xl backdrop:bg-black/60 backdrop:backdrop-blur-sm"
      >
        <div className="border-b border-border p-3">
          <Input
            size="lg"
            startIcon={<SearchIcon />}
            spellCheck={false}
            autoFocus
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setActive(0);
            }}
            onKeyDown={onKeyDown}
            placeholder="Search components…"
            role="combobox"
            aria-expanded
            aria-controls="search-results"
            aria-activedescendant={results[active] ? `result-${results[active].slug}` : undefined}
          />
        </div>
        <ScrollArea className="max-h-80" viewportClassName="max-h-80">
          <ul id="search-results" role="listbox" className="p-2">
            {results.length === 0 && (
              <li className="px-3 py-8 text-center text-sm text-muted-foreground">No components match “{query}”.</li>
            )}
            {results.map((e, i) => (
              <li
                key={e.slug}
                id={`result-${e.slug}`}
                role="option"
                aria-selected={i === active}
                onMouseEnter={() => setActive(i)}
                onClick={() => go(e.slug)}
                className={`flex cursor-pointer items-center justify-between rounded-lg px-3 py-2 text-sm ${i === active ? "bg-foreground/10 text-foreground" : "text-muted-foreground"}`}
              >
                {e.name}
                <span className="text-xs text-muted-foreground">{categoryLabel(e.category)}</span>
              </li>
            ))}
          </ul>
        </ScrollArea>
      </dialog>
    </>
  );
}
