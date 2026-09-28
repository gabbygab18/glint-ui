"use client";

import {
  createContext,
  useContext,
  useId,
  useRef,
  useState,
  type HTMLAttributes,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

type RootCtx = { open: string[]; toggle: (value: string) => void };
type ItemCtx = { value: string; open: boolean; disabled: boolean; triggerId: string; contentId: string };

const AccordionContext = createContext<RootCtx | null>(null);
const ItemContext = createContext<ItemCtx | null>(null);

function useItem() {
  const ctx = useContext(ItemContext);
  if (!ctx) throw new Error("Accordion parts must be rendered inside <AccordionItem>.");
  return ctx;
}

export interface AccordionProps extends Omit<HTMLAttributes<HTMLDivElement>, "defaultValue" | "onChange"> {
  /** `single` keeps at most one item open, `multiple` lets any number stay open. */
  type?: "single" | "multiple";
  /** In single mode, allow closing the open item so none are open. */
  collapsible?: boolean;
  /** Open item values (controlled). */
  value?: string[];
  /** Open item values on first render (uncontrolled). */
  defaultValue?: string[];
  onValueChange?: (value: string[]) => void;
}

export function Accordion({
  type = "single",
  collapsible = true,
  value,
  defaultValue = [],
  onValueChange,
  className,
  onKeyDown,
  children,
  ...props
}: AccordionProps) {
  const [inner, setInner] = useState(defaultValue);
  const open = value ?? inner;
  const root = useRef<HTMLDivElement>(null);

  const toggle = (v: string) => {
    const isOpen = open.includes(v);
    let next: string[];
    if (type === "multiple") next = isOpen ? open.filter((x) => x !== v) : [...open, v];
    else if (isOpen) next = collapsible ? [] : open;
    else next = [v];
    if (value === undefined) setInner(next);
    onValueChange?.(next);
  };

  // WAI-ARIA accordion: arrows move between headers, Home/End jump to the ends.
  const onKey = (e: KeyboardEvent<HTMLDivElement>) => {
    onKeyDown?.(e);
    const el = root.current;
    if (!el || !(e.target as HTMLElement).matches("[data-accordion-trigger]")) return;
    const triggers = [...el.querySelectorAll<HTMLButtonElement>("[data-accordion-trigger]:not(:disabled)")].filter(
      (t) => t.closest("[data-accordion]") === el,
    );
    const i = triggers.indexOf(e.target as HTMLButtonElement);
    const n = triggers.length;
    const next = { ArrowDown: i + 1, ArrowUp: i - 1 + n, Home: 0, End: n - 1 }[e.key];
    if (next === undefined || i < 0) return;
    e.preventDefault();
    triggers[next % n].focus();
  };

  return (
    <AccordionContext value={{ open, toggle }}>
      <div {...props} ref={root} data-accordion="" onKeyDown={onKey} className={cn("w-full", className)}>
        {children}
      </div>
    </AccordionContext>
  );
}

export interface AccordionItemProps extends HTMLAttributes<HTMLDivElement> {
  /** Unique id of this item within the accordion. */
  value: string;
  disabled?: boolean;
}

export function AccordionItem({ value, disabled = false, className, children, ...props }: AccordionItemProps) {
  const ctx = useContext(AccordionContext);
  if (!ctx) throw new Error("<AccordionItem> must be rendered inside <Accordion>.");
  const id = useId();
  const open = ctx.open.includes(value);
  return (
    <ItemContext value={{ value, open, disabled, triggerId: `${id}-t`, contentId: `${id}-c` }}>
      <div
        {...props}
        data-state={open ? "open" : "closed"}
        className={cn("border-b border-border last:border-b-0", className)}
      >
        {children}
      </div>
    </ItemContext>
  );
}

export interface AccordionTriggerProps extends HTMLAttributes<HTMLButtonElement> {
  /** Heading level wrapping the button, per the WAI-ARIA accordion pattern. */
  level?: 2 | 3 | 4 | 5 | 6;
  /** Replaces the default chevron. */
  icon?: ReactNode;
}

export function AccordionTrigger({ level = 3, icon, className, children, onClick, ...props }: AccordionTriggerProps) {
  const root = useContext(AccordionContext)!;
  const { value, open, disabled, triggerId, contentId } = useItem();
  const Heading = `h${level}` as const;
  return (
    <Heading className="flex">
      <button
        {...props}
        type="button"
        id={triggerId}
        data-accordion-trigger=""
        aria-expanded={open}
        aria-controls={contentId}
        disabled={disabled}
        onClick={(e) => {
          onClick?.(e);
          if (!e.defaultPrevented) root.toggle(value);
        }}
        className={cn(
          "group flex flex-1 items-center justify-between gap-4 rounded-md py-4 text-left text-sm font-medium text-foreground outline-none transition-colors",
          "hover:text-foreground/80 focus-visible:ring-2 focus-visible:ring-ring/60 disabled:cursor-not-allowed disabled:opacity-50",
          className,
        )}
      >
        {children}
        <span
          aria-hidden
          className={cn(
            "grid size-6 shrink-0 place-items-center rounded-full text-muted-foreground transition-[rotate,background-color,color] duration-300 ease-[cubic-bezier(.3,1.4,.5,1)] motion-reduce:transition-none",
            "group-hover:bg-muted group-hover:text-foreground",
            open && "rotate-180 bg-muted text-foreground",
          )}
        >
          {icon ?? <ChevronDown className="size-4" />}
        </span>
      </button>
    </Heading>
  );
}

export function AccordionContent({ className, children, ...props }: HTMLAttributes<HTMLDivElement>) {
  const { open, triggerId, contentId } = useItem();
  return (
    // Animating grid rows 0fr -> 1fr gives a smooth auto-height transition without measuring.
    <div
      {...props}
      id={contentId}
      role="region"
      aria-labelledby={triggerId}
      inert={!open}
      data-state={open ? "open" : "closed"}
      className="grid transition-[grid-template-rows] duration-300 ease-[cubic-bezier(.2,.8,.2,1)] motion-reduce:transition-none"
      style={{ gridTemplateRows: open ? "1fr" : "0fr" }}
    >
      <div className="overflow-hidden">
        <div
          className={cn(
            "pb-4 text-sm leading-relaxed text-muted-foreground transition-[opacity,translate] duration-300 motion-reduce:transition-none",
            open ? "translate-y-0 opacity-100" : "-translate-y-1 opacity-0",
            className,
          )}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
