"use client";

import { Search, X } from "lucide-react";
import { AnimatePresence, MotionConfig, motion } from "motion/react";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { cn } from "@/lib/utils";

export interface ExpandSearchProps {
  /** Width in px when open. */
  width?: number;
  placeholder?: string;
  /** Which side stays put while the field grows. */
  align?: "left" | "right";
  /** Called with the query on Enter. */
  onSearch?: (query: string) => void;
  /** Called on every keystroke. */
  onChange?: (query: string) => void;
  className?: string;
}

/**
 * A round search button that stretches into a field when pressed, focuses
 * itself, and folds back into the button on Escape or when it loses focus empty.
 */
export function ExpandSearch({
  width = 260,
  placeholder = "Search…",
  align = "right",
  onSearch,
  onChange,
  className,
}: ExpandSearchProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const input = useRef<HTMLInputElement>(null);
  const button = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (open) input.current?.focus();
  }, [open]);

  const set = (q: string) => {
    setQuery(q);
    onChange?.(q);
  };
  const collapse = (refocus: boolean) => {
    setOpen(false);
    set("");
    if (refocus) requestAnimationFrame(() => button.current?.focus());
  };
  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (query.trim()) onSearch?.(query.trim());
  };

  return (
    <MotionConfig reducedMotion="user">
      <div className={cn("flex", align === "right" ? "justify-end" : "justify-start", className)}>
        <motion.form
          role="search"
          onSubmit={submit}
          className="relative flex h-10 items-center overflow-hidden rounded-full border border-border bg-card text-foreground shadow-sm"
          initial={false}
          animate={{ width: open ? width : 40 }}
          transition={{ type: "spring", bounce: 0.22, duration: 0.45 }}
          onBlur={(e) => {
            if (!e.currentTarget.contains(e.relatedTarget as Node) && !query) collapse(false);
          }}
        >
          <button
            ref={button}
            type={open ? "submit" : "button"}
            aria-label={open ? "Submit search" : "Open search"}
            aria-expanded={open}
            onClick={() => !open && setOpen(true)}
            className="grid size-10 shrink-0 place-items-center rounded-full text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring"
          >
            <Search className="size-4" />
          </button>
          <input
            ref={input}
            type="search"
            value={query}
            onChange={(e) => set(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Escape") {
                e.preventDefault();
                collapse(true);
              }
            }}
            placeholder={placeholder}
            aria-label="Search"
            tabIndex={open ? 0 : -1}
            aria-hidden={!open}
            className="h-full min-w-0 flex-1 bg-transparent pr-2 text-sm outline-none placeholder:text-muted-foreground [&::-webkit-search-cancel-button]:hidden"
          />
          <AnimatePresence>
            {open && query && (
              <motion.button
                type="button"
                aria-label="Clear search"
                onClick={() => {
                  set("");
                  input.current?.focus();
                }}
                className="mr-2 grid size-6 shrink-0 place-items-center rounded-full bg-muted text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                transition={{ type: "spring", bounce: 0.4, duration: 0.3 }}
              >
                <X className="size-3" />
              </motion.button>
            )}
          </AnimatePresence>
        </motion.form>
      </div>
    </MotionConfig>
  );
}
