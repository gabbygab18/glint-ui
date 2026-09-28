"use client";

import {
  createContext,
  useContext,
  useId,
  useRef,
  useState,
  type ButtonHTMLAttributes,
  type HTMLAttributes,
  type KeyboardEvent,
} from "react";
import { MotionConfig, motion } from "motion/react";
import { cn } from "@/lib/utils";

// Panels replay their entrance whenever they go from display:none to visible;
// --ui-tab-dx makes them slide in from the side of the newly selected tab.
const css = `
@keyframes ui-tab-in{from{opacity:0;translate:var(--ui-tab-dx,0) 0;filter:blur(2px)}}
.ui-tab-panel:not([hidden]){animation:ui-tab-in .35s cubic-bezier(.2,.8,.2,1)}
@media (prefers-reduced-motion:reduce){.ui-tab-panel:not([hidden]){animation:none}}
`;

type Variant = "pill" | "underline";
type Ctx = {
  value: string;
  select: (value: string) => void;
  /** -1 / 1: which way the selection moved, for the panel slide. */
  dir: number;
  /** Values ever selected; panels mount lazily on first visit, then stay mounted. */
  visited: Set<string>;
  orientation: "horizontal" | "vertical";
  activation: "automatic" | "manual";
  variant: Variant;
  id: string;
};
const TabsContext = createContext<Ctx | null>(null);
const ListContext = createContext<Variant>("pill");

function useTabs() {
  const ctx = useContext(TabsContext);
  if (!ctx) throw new Error("Tabs parts must be rendered inside <Tabs>.");
  return ctx;
}

const safe = (v: string) => v.replace(/[^\w-]/g, "_");

export interface TabsProps extends Omit<HTMLAttributes<HTMLDivElement>, "defaultValue" | "onChange"> {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  orientation?: "horizontal" | "vertical";
  /** `automatic` selects on arrow-key focus; `manual` waits for Enter/Space. */
  activationMode?: "automatic" | "manual";
  /** Indicator style: a raised pill in a muted track, or a sliding underline. */
  variant?: Variant;
}

export function Tabs({
  value: valueProp,
  defaultValue = "",
  onValueChange,
  orientation = "horizontal",
  activationMode = "automatic",
  variant = "pill",
  className,
  children,
  ...props
}: TabsProps) {
  const [inner, setInner] = useState(defaultValue);
  const value = valueProp ?? inner;
  const [dir, setDir] = useState(0);
  const [visited, setVisited] = useState(() => new Set([value]));
  const root = useRef<HTMLDivElement>(null);
  const id = useId();
  if (!visited.has(value)) setVisited(new Set(visited).add(value)); // controlled changes count as visits too

  const select = (next: string) => {
    if (next === value) return;
    const tabs = [...(root.current?.querySelectorAll<HTMLElement>(`[data-tabs-root="${id}"] [role=tab]`) ?? [])];
    const at = (v: string) => tabs.findIndex((t) => t.dataset.value === v);
    setDir(Math.sign(at(next) - at(value)));
    if (valueProp === undefined) setInner(next);
    onValueChange?.(next);
  };

  return (
    <TabsContext value={{ value, select, dir, visited, orientation, activation: activationMode, variant, id }}>
      <MotionConfig reducedMotion="user">
        <div
          {...props}
          ref={root}
          data-tabs-root={id}
          data-orientation={orientation}
          className={cn("flex gap-4", orientation === "horizontal" ? "flex-col" : "flex-row", className)}
        >
          <style href="ui-tabs" precedence="default">
            {css}
          </style>
          {children}
        </div>
      </MotionConfig>
    </TabsContext>
  );
}

export function TabsList({ className, onKeyDown, ...props }: HTMLAttributes<HTMLDivElement>) {
  const { orientation, activation, variant } = useTabs();
  const h = orientation === "horizontal";

  // WAI-ARIA tabs: roving focus with arrows (wrapping), Home/End; disabled tabs are skipped.
  const onKey = (e: KeyboardEvent<HTMLDivElement>) => {
    onKeyDown?.(e);
    const tabs = [...e.currentTarget.querySelectorAll<HTMLButtonElement>("[role=tab]:not(:disabled)")];
    const i = tabs.indexOf(document.activeElement as HTMLButtonElement);
    if (i < 0) return;
    const n = tabs.length;
    const keys: Record<string, number> = h
      ? { ArrowRight: i + 1, ArrowLeft: i - 1 + n, Home: 0, End: n - 1 }
      : { ArrowDown: i + 1, ArrowUp: i - 1 + n, Home: 0, End: n - 1 };
    const next = keys[e.key];
    if (next === undefined) return;
    e.preventDefault();
    const t = tabs[next % n];
    t.focus();
    if (activation === "automatic") t.click();
  };

  return (
    <ListContext value={variant}>
      <div
        role="tablist"
        aria-orientation={orientation}
        {...props}
        onKeyDown={onKey}
        className={cn(
          "relative inline-flex w-fit shrink-0",
          h ? "flex-row items-center" : "flex-col items-stretch",
          variant === "pill" && "gap-1 rounded-xl bg-muted p-1",
          variant === "underline" && (h ? "gap-2 border-b border-border" : "gap-1 border-l border-border"),
          className,
        )}
      />
    </ListContext>
  );
}

export interface TabsTriggerProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  value: string;
}

export function TabsTrigger({ value, className, children, onClick, disabled, ...props }: TabsTriggerProps) {
  const ctx = useTabs();
  const variant = useContext(ListContext);
  const selected = ctx.value === value;
  const h = ctx.orientation === "horizontal";
  return (
    <button
      type="button"
      role="tab"
      id={`${ctx.id}-t-${safe(value)}`}
      aria-selected={selected}
      aria-controls={`${ctx.id}-p-${safe(value)}`}
      tabIndex={selected ? 0 : -1}
      data-value={value}
      data-state={selected ? "active" : "inactive"}
      disabled={disabled}
      {...props}
      onClick={(e) => {
        onClick?.(e);
        if (!e.defaultPrevented) ctx.select(value);
      }}
      className={cn(
        "relative inline-flex items-center justify-center gap-2 text-sm font-medium whitespace-nowrap outline-none select-none",
        "transition-[color,scale] duration-200 focus-visible:ring-2 focus-visible:ring-ring/60 active:scale-[0.97] disabled:pointer-events-none disabled:opacity-50 [&_svg]:size-4 [&_svg]:shrink-0",
        selected ? "text-foreground" : "text-muted-foreground hover:text-foreground",
        variant === "pill" && "h-8 rounded-lg px-3",
        variant === "underline" && (h ? "h-10 rounded-md px-3" : "h-9 justify-start rounded-md px-3"),
        className,
      )}
    >
      {selected && (
        <motion.span
          aria-hidden
          layoutId={`${ctx.id}-indicator`}
          transition={{ type: "spring", stiffness: 420, damping: 34 }}
          className={cn(
            "absolute",
            variant === "pill" && "inset-0 rounded-lg bg-background shadow-sm ring-1 ring-border/60",
            variant === "underline" && (h ? "inset-x-2 -bottom-px h-0.5 rounded-full bg-primary" : "inset-y-1.5 -left-px w-0.5 rounded-full bg-primary"),
          )}
        />
      )}
      <span className="relative inline-flex items-center gap-2">{children}</span>
    </button>
  );
}

export interface TabsContentProps extends HTMLAttributes<HTMLDivElement> {
  value: string;
  /** Mount even before the tab is first opened (e.g. for SEO or form fields). */
  forceMount?: boolean;
}

export function TabsContent({ value, forceMount = false, className, style, ...props }: TabsContentProps) {
  const ctx = useTabs();
  const selected = ctx.value === value;
  if (!forceMount && !ctx.visited.has(value)) return null;
  return (
    <div
      role="tabpanel"
      id={`${ctx.id}-p-${safe(value)}`}
      aria-labelledby={`${ctx.id}-t-${safe(value)}`}
      tabIndex={0}
      hidden={!selected}
      {...props}
      style={{ ["--ui-tab-dx" as string]: `${ctx.dir * 14}px`, ...style }}
      className={cn("ui-tab-panel flex-1 rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-ring/60", className)}
    />
  );
}
