"use client";

import { Fragment, useId, useMemo, useRef, useState, type ReactNode } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { CornerDownLeft, Search, SearchX } from "lucide-react";
import { cn } from "@/lib/utils";

export interface SearchItem {
  id: string;
  label: string;
  description?: string;
  /** Section heading the item is listed under. */
  group?: string;
  icon?: ReactNode;
  /** Extra words that match but are not shown. */
  keywords?: string[];
  /** Shortcut hint shown on the right, e.g. ["⌘", "N"]. */
  shortcut?: string[];
}

export interface SearchCellProps {
  items: SearchItem[];
  placeholder?: string;
  /** Fired with the chosen item (click or Enter). */
  onSelect?: (item: SearchItem) => void;
  /** Max rows shown at once. */
  maxResults?: number;
  /** Grow wider while open. */
  expand?: boolean;
  /** Start open (without stealing focus). */
  defaultOpen?: boolean;
  emptyMessage?: string;
  className?: string;
}

const escapeRe = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/** Wraps every query token found in `text` in a <mark>. */
function Highlight({ text, tokens }: { text: string; tokens: string[] }) {
  if (!tokens.length) return <>{text}</>;
  const re = new RegExp(`(${tokens.map(escapeRe).join("|")})`, "gi");
  return (
    <>
      {text.split(re).map((part, i) =>
        i % 2 ? (
          <mark key={i} className="rounded-[3px] bg-primary/25 px-px text-foreground">
            {part}
          </mark>
        ) : (
          <Fragment key={i}>{part}</Fragment>
        ),
      )}
    </>
  );
}

export function SearchCell({
  items,
  placeholder = "Search or jump to…",
  onSelect,
  maxResults = 7,
  expand = true,
  defaultOpen = false,
  emptyMessage = "No results for",
  className,
}: SearchCellProps) {
  const id = useId();
  const reduce = useReducedMotion();
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(defaultOpen);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);

  const tokens = useMemo(() => query.trim().toLowerCase().split(/\s+/).filter(Boolean), [query]);
  const results = useMemo(() => {
    const hits = items.filter((it) => {
      const hay = [it.label, it.description, ...(it.keywords ?? [])].join(" ").toLowerCase();
      return tokens.every((t) => hay.includes(t));
    });
    // Label prefix matches first, then label contains, then everything else; stable within a rank.
    const rank = (it: SearchItem) => {
      const l = it.label.toLowerCase();
      return !tokens.length ? 0 : l.startsWith(tokens[0]) ? 0 : tokens.every((t) => l.includes(t)) ? 1 : 2;
    };
    return hits
      .map((it, i) => ({ it, r: rank(it), i }))
      .sort((a, b) => a.r - b.r || a.i - b.i)
      .slice(0, maxResults)
      .map((x) => x.it);
  }, [items, tokens, maxResults]);

  // Group while keeping ranked order of first appearance.
  const groups = useMemo(() => {
    const map = new Map<string, SearchItem[]>();
    for (const it of results) {
      const g = it.group ?? "";
      if (!map.has(g)) map.set(g, []);
      map.get(g)!.push(it);
    }
    return [...map];
  }, [results]);
  const flat = groups.flatMap(([, list]) => list);
  const current = Math.min(active, Math.max(0, flat.length - 1));

  const move = (d: number) => {
    if (!flat.length) return;
    const next = (current + d + flat.length) % flat.length;
    setActive(next);
    listRef.current?.querySelector(`[data-index="${next}"]`)?.scrollIntoView({ block: "nearest" });
  };

  const choose = (it: SearchItem) => {
    onSelect?.(it);
    setQuery("");
    setActive(0);
    setOpen(false);
    (document.activeElement as HTMLElement | null)?.blur();
  };

  const optionId = (i: number) => `${id}-o${i}`;

  return (
    <div
      className={cn(
        "relative max-w-full transition-[width] duration-500 ease-[cubic-bezier(.2,.9,.25,1)] motion-reduce:transition-none",
        open && expand ? "w-[30rem]" : "w-72",
        className,
      )}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node)) setOpen(false);
      }}
    >
      <div
        className={cn(
          "overflow-hidden rounded-2xl border bg-popover text-popover-foreground transition-[box-shadow,border-color] duration-300",
          open ? "border-border shadow-2xl shadow-black/40" : "border-border/80 shadow-md shadow-black/10 hover:border-foreground/20",
        )}
      >
        <div className="relative flex h-12 items-center gap-3 px-4">
          <motion.span
            aria-hidden
            animate={{ rotate: open && !reduce ? -12 : 0, scale: open ? 1.08 : 1 }}
            className={cn("shrink-0 transition-colors", open ? "text-foreground" : "text-muted-foreground")}
          >
            <Search className="size-4.5" />
          </motion.span>
          <input
            ref={inputRef}
            role="combobox"
            aria-expanded={open}
            aria-controls={`${id}-list`}
            aria-autocomplete="list"
            aria-activedescendant={open && flat.length ? optionId(current) : undefined}
            aria-label={placeholder}
            placeholder={placeholder}
            value={query}
            onFocus={() => setOpen(true)}
            onClick={() => setOpen(true)}
            onChange={(e) => {
              setQuery(e.target.value);
              setActive(0);
              setOpen(true);
            }}
            onKeyDown={(e) => {
              if (e.key === "ArrowDown") {
                e.preventDefault();
                if (!open) setOpen(true);
                else move(1);
              } else if (e.key === "ArrowUp") {
                e.preventDefault();
                move(-1);
              } else if (e.key === "Home" && open) {
                e.preventDefault();
                setActive(0);
              } else if (e.key === "End" && open) {
                e.preventDefault();
                setActive(flat.length - 1);
              } else if (e.key === "Enter" && open && flat[current]) {
                e.preventDefault();
                choose(flat[current]);
              } else if (e.key === "Escape") {
                if (query) setQuery("");
                else {
                  setOpen(false);
                  inputRef.current?.blur();
                }
              }
            }}
            className="h-full min-w-0 flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
          />
          {open && (
            <kbd className="hidden rounded-md border border-border bg-muted px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground sm:inline">
              Esc
            </kbd>
          )}
        </div>

        <AnimatePresence initial={false}>
          {open && (
            <motion.div
              key="panel"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: reduce ? 0 : 0.28, ease: [0.2, 0.9, 0.25, 1] }}
              className="border-t border-border"
            >
              <div ref={listRef} id={`${id}-list`} role="listbox" aria-label="Results" className="max-h-80 overflow-y-auto p-1.5 [scrollbar-width:thin]">
                {flat.length === 0 ? (
                  <div className="grid place-items-center gap-2 px-4 py-10 text-center text-sm text-muted-foreground" role="presentation">
                    <SearchX className="size-6 opacity-60" aria-hidden />
                    <p>
                      {emptyMessage} <span className="font-medium text-foreground">&ldquo;{query.trim()}&rdquo;</span>
                    </p>
                  </div>
                ) : (
                  groups.map(([group, list]) => (
                    <div key={group || "_"} role="group" aria-label={group || undefined}>
                      {group && (
                        <div className="px-2.5 pt-2 pb-1 text-[11px] font-medium tracking-wide text-muted-foreground uppercase" aria-hidden>
                          {group}
                        </div>
                      )}
                      {list.map((it) => {
                        const i = flat.indexOf(it);
                        const on = i === current;
                        return (
                          <motion.div
                            key={it.id}
                            id={optionId(i)}
                            data-index={i}
                            role="option"
                            aria-selected={on}
                            initial={reduce ? false : { opacity: 0, y: 6 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: reduce ? 0 : Math.min(i, 8) * 0.025 }}
                            onMouseDown={(e) => e.preventDefault()}
                            onMouseMove={() => active !== i && setActive(i)}
                            onClick={() => choose(it)}
                            className="relative flex cursor-pointer items-center gap-3 rounded-xl px-2.5 py-2"
                          >
                            {on && (
                              <motion.span
                                layoutId={`${id}-hl`}
                                aria-hidden
                                className="absolute inset-0 rounded-xl bg-muted"
                                transition={{ type: "spring", stiffness: 600, damping: 45 }}
                              />
                            )}
                            {it.icon && (
                              <span
                                aria-hidden
                                className={cn(
                                  "relative grid size-8 shrink-0 place-items-center rounded-[9px] border border-border bg-background transition-colors [&_svg]:size-4",
                                  on ? "text-foreground" : "text-muted-foreground",
                                )}
                              >
                                {it.icon}
                              </span>
                            )}
                            <span className="relative min-w-0 flex-1">
                              <span className="block truncate text-sm font-medium text-foreground">
                                <Highlight text={it.label} tokens={tokens} />
                              </span>
                              {it.description && (
                                <span className="block truncate text-xs text-muted-foreground">
                                  <Highlight text={it.description} tokens={tokens} />
                                </span>
                              )}
                            </span>
                            {on ? (
                              <CornerDownLeft className="relative size-3.5 shrink-0 text-muted-foreground" aria-hidden />
                            ) : (
                              it.shortcut && (
                                <span className="relative flex shrink-0 gap-1" aria-hidden>
                                  {it.shortcut.map((k) => (
                                    <kbd key={k} className="min-w-5 rounded-[5px] border border-border bg-background px-1 text-center font-mono text-[10px] leading-5 text-muted-foreground">
                                      {k}
                                    </kbd>
                                  ))}
                                </span>
                              )
                            )}
                          </motion.div>
                        );
                      })}
                    </div>
                  ))
                )}
              </div>
              <div className="flex items-center justify-between border-t border-border px-3.5 py-2 text-[11px] text-muted-foreground" aria-hidden>
                <span className="flex items-center gap-3">
                  <span className="flex items-center gap-1">
                    <kbd className="rounded border border-border bg-muted px-1 font-mono">↑</kbd>
                    <kbd className="rounded border border-border bg-muted px-1 font-mono">↓</kbd>
                    navigate
                  </span>
                  <span className="flex items-center gap-1">
                    <kbd className="rounded border border-border bg-muted px-1 font-mono">↵</kbd>
                    open
                  </span>
                </span>
                <span className="tabular-nums">
                  {flat.length} result{flat.length === 1 ? "" : "s"}
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <span className="sr-only" role="status" aria-live="polite">
        {open ? `${flat.length} result${flat.length === 1 ? "" : "s"}` : ""}
      </span>
    </div>
  );
}
