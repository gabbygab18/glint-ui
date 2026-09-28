"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { AnimatePresence, MotionConfig, motion } from "motion/react";
import { CircleAlert, CircleCheck, Info, Loader2, TriangleAlert, X } from "lucide-react";
import { cn } from "@/lib/utils";

// The countdown is a CSS animation on the progress bar: pausing it (hover, focus, hidden tab)
// pauses the timer for free, and `animationend` is the dismiss signal.
const css = `
@keyframes ui-toast-timer{from{scale:1 1}to{scale:0 1}}
.ui-toast-bar{animation:ui-toast-timer var(--ui-toast-ms) linear forwards;transform-origin:left}
[data-paused] .ui-toast-bar{animation-play-state:paused}
@keyframes ui-toast-icon{0%{scale:.3;rotate:-30deg;opacity:0}60%{scale:1.15}100%{scale:1;rotate:0;opacity:1}}
.ui-toast-icon{animation:ui-toast-icon .45s cubic-bezier(.3,1.4,.5,1) .08s both}
@media (prefers-reduced-motion:reduce){.ui-toast-bar{opacity:0}.ui-toast-icon{animation:none}}
`;

export type ToastVariant = "default" | "success" | "error" | "warning" | "info" | "loading";
export type ToastPlacement = "top-left" | "top-center" | "top-right" | "bottom-left" | "bottom-center" | "bottom-right";

export interface ToastOptions {
  /** Reuse an id to update a toast in place (e.g. loading -> success). */
  id?: string;
  title: ReactNode;
  description?: ReactNode;
  variant?: ToastVariant;
  /** ms before auto-dismiss; Infinity keeps it until closed. Loading toasts never auto-dismiss. */
  duration?: number;
  action?: { label: string; onClick: () => void };
}

type ToastItem = ToastOptions & { id: string; variant: ToastVariant; duration: number };

type Ctx = { toast: (t: ToastOptions) => string; dismiss: (id?: string) => void };
const ToastContext = createContext<Ctx | null>(null);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used inside <ToastProvider>.");
  return ctx;
}

const icons: Record<ToastVariant, ReactNode> = {
  default: null,
  success: <CircleCheck className="text-emerald-500" />,
  error: <CircleAlert className="text-destructive" />,
  warning: <TriangleAlert className="text-amber-500" />,
  info: <Info className="text-sky-500" />,
  loading: <Loader2 className="animate-spin text-muted-foreground" />,
};

const GAP = 10;
const PEEK = 12; // px each stacked toast peeks out behind the one in front
const VISIBLE = 3;

export interface ToastProviderProps {
  children?: ReactNode;
  placement?: ToastPlacement;
  /** `fixed` pins to the viewport; `absolute` stays inside the nearest positioned ancestor. */
  position?: "fixed" | "absolute";
  /** Default auto-dismiss time, ms. */
  duration?: number;
  /** Always show the full list instead of a collapsed stack. */
  expand?: boolean;
}

let seq = 0;

export function ToastProvider({
  children,
  placement = "bottom-right",
  position = "fixed",
  duration = 4000,
  expand = false,
}: ToastProviderProps) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [heights, setHeights] = useState<Record<string, number>>({});
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);

  const dismiss = useCallback((id?: string) => {
    setToasts((all) => (id === undefined ? [] : all.filter((t) => t.id !== id)));
  }, []);

  const toast = useCallback(
    (o: ToastOptions) => {
      const id = o.id ?? `toast-${++seq}`;
      const variant = o.variant ?? "default";
      const item: ToastItem = { ...o, id, variant, duration: variant === "loading" ? Infinity : (o.duration ?? duration) };
      setToasts((all) => (all.some((t) => t.id === id) ? all.map((t) => (t.id === id ? item : t)) : [item, ...all]));
      return id;
    },
    [duration],
  );

  const ctx = useMemo(() => ({ toast, dismiss }), [toast, dismiss]);
  const measure = useCallback((id: string, h: number) => setHeights((m) => (m[id] === h ? m : { ...m, [id]: h })), []);

  const top = placement.startsWith("top");
  const open = expand || hovered || focused;
  const frontHeight = heights[toasts[0]?.id] ?? 0;

  return (
    <ToastContext value={ctx}>
      {children}
      <style href="ui-toast" precedence="default">
        {css}
      </style>
      <MotionConfig reducedMotion="user">
        <section
          aria-label="Notifications"
          tabIndex={-1}
          onPointerEnter={() => setHovered(true)}
          onPointerLeave={() => setHovered(false)}
          onFocus={() => setFocused(true)}
          onBlur={(e) => !e.currentTarget.contains(e.relatedTarget) && setFocused(false)}
          className={cn(
            "pointer-events-none z-[100] w-[calc(100%-2rem)] max-w-sm outline-none",
            position === "fixed" ? "fixed" : "absolute",
            top ? "top-4" : "bottom-4",
            placement.endsWith("left") && "left-4",
            placement.endsWith("right") && "right-4",
            placement.endsWith("center") && "left-1/2 -translate-x-1/2",
          )}
        >
          <ol
            className="pointer-events-auto relative"
            // Reserve room for the stack (or the full list when expanded) so hover keeps working in the gaps.
            style={{
              height: toasts.length
                ? open
                  ? toasts.reduce((s, t) => s + (heights[t.id] ?? 0), 0) + GAP * (toasts.length - 1)
                  : frontHeight + PEEK * Math.min(toasts.length - 1, VISIBLE - 1)
                : 0,
            }}
          >
            <AnimatePresence initial={false}>
              {toasts.map((t, i) => {
                const before = toasts.slice(0, i).reduce((s, x) => s + (heights[x.id] ?? 0) + GAP, 0);
                const offset = open ? before : i * PEEK;
                return (
                  <Toast
                    key={t.id}
                    item={t}
                    index={i}
                    top={top}
                    y={top ? offset : -offset}
                    scale={open ? 1 : 1 - i * 0.05}
                    hidden={!open && i >= VISIBLE}
                    collapsedHeight={!open && i > 0 ? frontHeight : undefined}
                    paused={open}
                    onHeight={measure}
                    onDismiss={dismiss}
                  />
                );
              })}
            </AnimatePresence>
          </ol>
        </section>
      </MotionConfig>
    </ToastContext>
  );
}

interface ToastProps {
  item: ToastItem;
  index: number;
  top: boolean;
  y: number;
  scale: number;
  hidden: boolean;
  /** When collapsed, back toasts take the front toast's height so only their edge peeks out. */
  collapsedHeight?: number;
  paused: boolean;
  onHeight: (id: string, h: number) => void;
  onDismiss: (id: string) => void;
}

function Toast({ item, index, top, y, scale, hidden, collapsedHeight, paused, onHeight, onDismiss }: ToastProps) {
  const inner = useRef<HTMLDivElement>(null);
  const [tabHidden, setTabHidden] = useState(false);

  useLayoutEffect(() => {
    const el = inner.current;
    if (!el) return;
    const ro = new ResizeObserver(() => onHeight(item.id, el.offsetHeight));
    ro.observe(el);
    return () => ro.disconnect();
  }, [item.id, onHeight]);

  useEffect(() => {
    const sync = () => setTabHidden(document.hidden);
    document.addEventListener("visibilitychange", sync);
    return () => document.removeEventListener("visibilitychange", sync);
  }, []);

  const icon = icons[item.variant];
  const timed = Number.isFinite(item.duration);
  const alert = item.variant === "error" || item.variant === "warning";

  return (
    <motion.li
      role={alert ? "alert" : "status"}
      aria-live={alert ? "assertive" : "polite"}
      aria-atomic
      data-paused={paused || tabHidden || undefined}
      initial={{ opacity: 0, y: top ? -40 : 40, scale: 0.92 }}
      animate={{ opacity: hidden ? 0 : 1, y, scale, height: collapsedHeight ?? "auto" }}
      exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
      transition={{ type: "spring", stiffness: 380, damping: 32 }}
      drag="x"
      dragSnapToOrigin
      dragElastic={0.6}
      onDragEnd={(_, info) => Math.abs(info.offset.x) > 80 && onDismiss(item.id)}
      onKeyDown={(e) => e.key === "Escape" && onDismiss(item.id)}
      style={{ zIndex: 100 - index, transformOrigin: top ? "bottom center" : "top center" }}
      className={cn(
        "absolute inset-x-0 cursor-grab touch-pan-y overflow-hidden rounded-xl border border-border bg-popover text-popover-foreground shadow-lg shadow-black/15 active:cursor-grabbing",
        top ? "top-0" : "bottom-0",
        hidden && "pointer-events-none",
      )}
      inert={hidden || undefined}
    >
      <div
        ref={inner}
        className={cn(
          "flex items-start gap-3 p-4 pr-10 transition-opacity duration-200",
          collapsedHeight !== undefined && "opacity-0",
        )}
      >
        {icon && (
          <span key={item.variant} className="ui-toast-icon mt-0.5 shrink-0 [&_svg]:size-[18px]">
            {icon}
          </span>
        )}
        <div className="grid min-w-0 flex-1 gap-1">
          <p className="text-sm leading-tight font-semibold">{item.title}</p>
          {item.description && <p className="text-sm leading-snug text-muted-foreground">{item.description}</p>}
          {item.action && (
            <button
              type="button"
              onClick={() => {
                item.action!.onClick();
                onDismiss(item.id);
              }}
              className="mt-1.5 inline-flex h-7 w-fit items-center rounded-md bg-primary px-2.5 text-xs font-medium text-primary-foreground outline-none transition-[background-color,scale] hover:bg-primary/90 focus-visible:ring-2 focus-visible:ring-ring/60 active:scale-95"
            >
              {item.action.label}
            </button>
          )}
        </div>
        <button
          type="button"
          aria-label="Dismiss notification"
          onClick={() => onDismiss(item.id)}
          className="absolute top-3 right-3 grid size-6 place-items-center rounded-md text-muted-foreground outline-none transition-[background-color,color,rotate] duration-200 hover:rotate-90 hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/60 motion-reduce:transition-none"
        >
          <X className="size-3.5" />
        </button>
      </div>
      {timed && (
        <span
          key={`${item.variant}-${item.duration}-${String(item.title)}`}
          aria-hidden
          className="ui-toast-bar absolute inset-x-0 bottom-0 h-0.5 bg-primary/60"
          style={{ ["--ui-toast-ms" as string]: `${item.duration}ms` }}
          onAnimationEnd={() => onDismiss(item.id)}
        />
      )}
    </motion.li>
  );
}
