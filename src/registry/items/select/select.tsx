"use client";

import {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import { MotionConfig, motion } from "motion/react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

// The listbox is a native `popover="manual"` element: top layer, never clipped by
// overflow:hidden parents. Enter/exit via :popover-open + @starting-style; options
// cascade in with a short stagger and the check mark draws its stroke.
const css = `
.ui-select-pop{opacity:0;scale:.96;translate:0 var(--ui-sel-dy,-6px);transition:opacity .12s ease-in,scale .12s ease-in,translate .12s ease-in,display .12s allow-discrete,overlay .12s allow-discrete}
.ui-select-pop:popover-open{opacity:1;scale:1;translate:0 0;transition-duration:.22s;transition-timing-function:cubic-bezier(.2,.9,.3,1.1)}
@starting-style{.ui-select-pop:popover-open{opacity:0;scale:.96;translate:0 var(--ui-sel-dy,-6px)}}
@keyframes ui-select-opt{from{opacity:0;translate:0 -3px}}
.ui-select-pop:popover-open [role=option]{animation:ui-select-opt .25s ease-out both;animation-delay:calc(min(var(--i),10)*18ms)}
.ui-select-check path{stroke-dasharray:1;stroke-dashoffset:1;transition:stroke-dashoffset .25s cubic-bezier(.6,0,.4,1) .05s}
[aria-selected=true] .ui-select-check path{stroke-dashoffset:0}
@keyframes ui-select-val{from{opacity:0;translate:0 4px}}
.ui-select-val{animation:ui-select-val .22s ease-out}
@media (prefers-reduced-motion:reduce){.ui-select-pop{transition-property:opacity,display,overlay;scale:1;translate:0 0}.ui-select-pop [role=option],.ui-select-val{animation:none!important}.ui-select-check path{transition:none}}
`;

export type SelectOption = { value: string; label: string; icon?: ReactNode; description?: string; disabled?: boolean };
export type SelectGroup = { label: string; options: SelectOption[] };

export interface SelectProps {
  /** Options, optionally grouped under a heading. */
  options: (SelectOption | SelectGroup)[];
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  placeholder?: string;
  /** Form field name; the value is submitted like a native select. */
  name?: string;
  required?: boolean;
  disabled?: boolean;
  /** Open on first render (uncontrolled). */
  defaultOpen?: boolean;
  /** Id for the trigger, so a `<label htmlFor>` can name it. */
  id?: string;
  "aria-label"?: string;
  "aria-labelledby"?: string;
  className?: string;
}

const isGroup = (o: SelectOption | SelectGroup): o is SelectGroup => "options" in o;

export function Select({
  options,
  value: valueProp,
  defaultValue = "",
  onValueChange,
  placeholder = "Select an option",
  name,
  required,
  disabled,
  defaultOpen = false,
  id,
  className,
  ...aria
}: SelectProps) {
  const [inner, setInner] = useState(defaultValue);
  const value = valueProp ?? inner;
  const [open, setOpen] = useState(defaultOpen);
  const flat = options.flatMap((o) => (isGroup(o) ? o.options : [o]));
  const selectedIndex = flat.findIndex((o) => o.value === value);
  const [active, setActive] = useState(selectedIndex);
  const selected = flat[selectedIndex];

  const uid = useId();
  const triggerId = id ?? `${uid}-trigger`;
  const listId = `${uid}-list`;
  const optId = (i: number) => `${uid}-opt-${i}`;
  const trigger = useRef<HTMLButtonElement>(null);
  const list = useRef<HTMLDivElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const typed = useRef({ text: "", timer: undefined as ReturnType<typeof setTimeout> | undefined });

  const commit = (i: number) => {
    const o = flat[i];
    if (!o || o.disabled) return;
    if (valueProp === undefined) setInner(o.value);
    if (o.value !== value) onValueChange?.(o.value);
  };

  const show = (at: number) => {
    setActive(at);
    setOpen(true);
  };

  const enabled = (i: number) => flat[i] && !flat[i].disabled;
  // Next enabled index from `from` in direction `dir`, staying put at the ends.
  const step = (from: number, dir: 1 | -1) => {
    for (let i = from + dir; i >= 0 && i < flat.length; i += dir) if (enabled(i)) return i;
    return from;
  };
  const first = () => step(-1, 1);
  const last = () => step(flat.length, -1);

  // Typeahead: accumulate keys for 500ms; repeating one letter cycles through matches.
  const typeahead = (key: string) => {
    const t = typed.current;
    clearTimeout(t.timer);
    t.text = t.text === key ? key : t.text + key;
    t.timer = setTimeout(() => (t.text = ""), 500);
    const q = t.text.toLowerCase();
    const start = open ? active : selectedIndex;
    const order = [...flat.keys()].map((k) => (start + 1 + k) % flat.length);
    const hit = order.find((i) => enabled(i) && flat[i].label.toLowerCase().startsWith(q));
    if (hit === undefined) return;
    if (open) setActive(hit);
    else commit(hit);
  };

  const onKeyDown = (e: KeyboardEvent<HTMLButtonElement>) => {
    const k = e.key;
    if (k.length === 1 && k !== " " && !e.ctrlKey && !e.metaKey && !e.altKey) {
      typeahead(k);
      return;
    }
    if (k === " " && typed.current.text) {
      e.preventDefault();
      typeahead(k);
      return;
    }
    if (!open) {
      const at = selectedIndex >= 0 ? selectedIndex : first();
      const map: Record<string, number> = { ArrowDown: at, ArrowUp: at, Enter: at, " ": at, Home: first(), End: last() };
      if (map[k] === undefined) return;
      e.preventDefault();
      show(map[k]);
      return;
    }
    if (k === "Escape") {
      e.preventDefault();
      setOpen(false);
    } else if (k === "Enter" || k === " " || (k === "ArrowUp" && e.altKey)) {
      e.preventDefault();
      commit(active);
      setOpen(false);
    } else if (k === "Tab") {
      commit(active);
      setOpen(false);
    } else {
      const move: Record<string, number> = {
        ArrowDown: step(active, 1),
        ArrowUp: step(active, -1),
        Home: first(),
        End: last(),
        PageDown: Math.min(flat.length - 1, active + 10),
        PageUp: Math.max(0, active - 10),
      };
      if (move[k] === undefined) return;
      e.preventDefault();
      setActive(enabled(move[k]) ? move[k] : step(move[k], k === "PageUp" ? 1 : -1));
    }
  };

  // Place the popover under the trigger (or above when there is no room), matching its width.
  const place = useCallback(() => {
    const t = trigger.current?.getBoundingClientRect();
    const p = list.current;
    if (!t || !p) return;
    const h = p.offsetHeight;
    const below = window.innerHeight - t.bottom - 8;
    const up = below < h && t.top > below;
    p.style.minWidth = `${t.width}px`;
    p.style.left = `${Math.min(t.left, window.innerWidth - p.offsetWidth - 8)}px`;
    p.style.top = `${up ? t.top - 6 - h : t.bottom + 6}px`;
    p.style.setProperty("--ui-sel-dy", up ? "6px" : "-6px");
    p.style.transformOrigin = up ? "bottom" : "top";
  }, []);

  useLayoutEffect(() => {
    const p = list.current;
    if (!p?.showPopover) return;
    if (!open) {
      if (p.matches(":popover-open")) p.hidePopover();
      return;
    }
    if (!p.matches(":popover-open")) p.showPopover();
    place();
    const outside = (e: Event) => {
      const n = e.target as Node;
      if (!trigger.current?.contains(n) && !p.contains(n)) setOpen(false);
    };
    window.addEventListener("resize", place);
    window.addEventListener("scroll", place, true);
    document.addEventListener("pointerdown", outside);
    return () => {
      window.removeEventListener("resize", place);
      window.removeEventListener("scroll", place, true);
      document.removeEventListener("pointerdown", outside);
    };
  }, [open, place]);

  useEffect(() => {
    if (open) list.current?.querySelector(`[id="${optId(active)}"]`)?.scrollIntoView({ block: "nearest" });
  });

  // Form integration: reset restores the default; an invalid required field focuses the trigger.
  useEffect(() => {
    const form = input.current?.form;
    if (!form || valueProp !== undefined) return;
    const reset = () => setInner(defaultValue);
    form.addEventListener("reset", reset);
    return () => form.removeEventListener("reset", reset);
  }, [defaultValue, valueProp]);
  useEffect(() => () => clearTimeout(typed.current.timer), []);

  let i = -1;
  const renderOption = (o: SelectOption) => {
    const idx = ++i;
    const isActive = open && idx === active;
    return (
      <div
        key={o.value}
        id={optId(idx)}
        role="option"
        aria-selected={o.value === value}
        aria-disabled={o.disabled || undefined}
        data-active={isActive || undefined}
        style={{ "--i": idx } as CSSProperties}
        onPointerMove={() => !o.disabled && idx !== active && setActive(idx)}
        onClick={() => {
          if (o.disabled) return;
          commit(idx);
          setOpen(false);
        }}
        className={cn(
          "relative flex cursor-default items-center gap-2.5 rounded-md py-2 pr-8 pl-2.5 text-sm text-popover-foreground outline-none select-none",
          o.disabled && "opacity-45",
        )}
      >
        {isActive && (
          <motion.span
            layoutId={`${uid}-hl`}
            transition={{ type: "spring", stiffness: 600, damping: 40 }}
            className="absolute inset-0 rounded-md bg-muted"
          />
        )}
        {o.icon && <span className="relative grid shrink-0 place-items-center text-muted-foreground [&_svg]:size-4">{o.icon}</span>}
        <span className="relative grid min-w-0">
          <span className="truncate">{o.label}</span>
          {o.description && <span className="truncate text-xs text-muted-foreground">{o.description}</span>}
        </span>
        <svg
          aria-hidden
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2.75}
          strokeLinecap="round"
          strokeLinejoin="round"
          className="ui-select-check absolute right-2.5 size-4 text-primary"
        >
          <path pathLength={1} d="M5 12.5l4.5 4.5L19 7.5" />
        </svg>
      </div>
    );
  };

  return (
    <MotionConfig reducedMotion="user">
      <div className={cn("relative w-full max-w-xs", className)}>
        <style href="ui-select" precedence="default">
          {css}
        </style>
        <button
          ref={trigger}
          id={triggerId}
          type="button"
          role="combobox"
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-controls={listId}
          aria-activedescendant={open && active >= 0 ? optId(active) : undefined}
          aria-required={required || undefined}
          {...aria}
          disabled={disabled}
          onClick={() => (open ? setOpen(false) : show(selectedIndex >= 0 ? selectedIndex : first()))}
          onKeyDown={onKeyDown}
          onBlur={() => setOpen(false)}
          className={cn(
            "flex h-10 w-full items-center justify-between gap-2 rounded-lg border border-input bg-background px-3 text-left text-sm shadow-xs outline-none",
            "transition-[border-color,box-shadow] duration-200 hover:border-ring/50 focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50",
            open && "border-ring/60 ring-[3px] ring-ring/20",
          )}
        >
          <span key={value} className={cn("ui-select-val flex min-w-0 items-center gap-2", !selected && "text-muted-foreground")}>
            {selected?.icon && <span className="grid shrink-0 place-items-center text-muted-foreground [&_svg]:size-4">{selected.icon}</span>}
            <span className="truncate">{selected?.label ?? placeholder}</span>
          </span>
          <ChevronDown
            aria-hidden
            className={cn(
              "size-4 shrink-0 text-muted-foreground transition-transform duration-300 ease-[cubic-bezier(.3,1.4,.5,1)] motion-reduce:transition-none",
              open && "rotate-180",
            )}
          />
        </button>
        <div
          ref={list}
          id={listId}
          role="listbox"
          popover="manual"
          aria-labelledby={aria["aria-labelledby"] ?? triggerId}
          tabIndex={-1}
          // Keep focus on the combobox while clicking options.
          onMouseDown={(e) => e.preventDefault()}
          className="ui-select-pop fixed inset-auto m-0 max-h-72 overflow-y-auto overscroll-contain rounded-xl border border-border bg-popover p-1 text-popover-foreground shadow-xl shadow-black/20"
        >
          {options.map((o, g) =>
            isGroup(o) ? (
              <div key={`g${g}`} role="group" aria-labelledby={`${uid}-g${g}`} className="not-first:mt-1 not-first:border-t not-first:border-border not-first:pt-1">
                <div id={`${uid}-g${g}`} className="px-2.5 pt-1.5 pb-1 text-xs font-medium text-muted-foreground">
                  {o.label}
                </div>
                {o.options.map(renderOption)}
              </div>
            ) : (
              renderOption(o)
            ),
          )}
        </div>
        {name !== undefined && (
          <input
            ref={input}
            aria-hidden
            tabIndex={-1}
            name={name}
            value={value}
            required={required}
            disabled={disabled}
            onChange={() => {}}
            onInvalid={() => trigger.current?.focus()}
            className="pointer-events-none absolute inset-x-0 bottom-0 h-px opacity-0"
          />
        )}
      </div>
    </MotionConfig>
  );
}
