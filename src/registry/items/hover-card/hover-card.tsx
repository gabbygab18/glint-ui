"use client";

import {
  createContext,
  useContext,
  useEffect,
  useId,
  useRef,
  useState,
  type AnchorHTMLAttributes,
  type HTMLAttributes,
  type ReactNode,
  type RefObject,
} from "react";
import { cn } from "@/lib/utils";

// Content is a native `popover="manual"`: rendered in the top layer (never clipped),
// but opening/closing is ours, driven by hover and focus with delays.
const css = `
.ui-hovercard{position:fixed;inset:auto;margin:0;overflow:visible;opacity:0;scale:.92;filter:blur(3px);translate:var(--from,0 0);transition:opacity .15s ease-in,scale .15s ease-in,filter .15s,translate .15s ease-in,display .15s allow-discrete,overlay .15s allow-discrete}
.ui-hovercard:popover-open{opacity:1;scale:1;filter:blur(0);translate:0 0;transition-duration:.3s;transition-timing-function:cubic-bezier(.2,.9,.3,1.1)}
@starting-style{.ui-hovercard:popover-open{opacity:0;scale:.92;filter:blur(3px);translate:var(--from,0 0)}}
.ui-hovercard[data-side=bottom]{--from:0 -10px;transform-origin:var(--arrow) top}
.ui-hovercard[data-side=top]{--from:0 10px;transform-origin:var(--arrow) bottom}
.ui-hovercard[data-side=left]{--from:10px 0;transform-origin:right var(--arrow)}
.ui-hovercard[data-side=right]{--from:-10px 0;transform-origin:left var(--arrow)}
.ui-hovercard-arrow{position:absolute;width:10px;height:10px;rotate:45deg;background:inherit;border:inherit}
.ui-hovercard[data-side=bottom]>.ui-hovercard-arrow{top:-6px;left:calc(var(--arrow) - 5px);border-right:0;border-bottom:0}
.ui-hovercard[data-side=top]>.ui-hovercard-arrow{bottom:-6px;left:calc(var(--arrow) - 5px);border-left:0;border-top:0}
.ui-hovercard[data-side=right]>.ui-hovercard-arrow{left:-6px;top:calc(var(--arrow) - 5px);border-right:0;border-top:0}
.ui-hovercard[data-side=left]>.ui-hovercard-arrow{right:-6px;top:calc(var(--arrow) - 5px);border-left:0;border-bottom:0}
@media (prefers-reduced-motion:reduce){.ui-hovercard{transition-duration:0s!important}}
`;

type Side = "top" | "right" | "bottom" | "left";
type Align = "start" | "center" | "end";
const OPPOSITE = { top: "bottom", bottom: "top", left: "right", right: "left" } as const;

/** Position a fixed element beside an anchor: flip if the preferred side lacks room, then shift into the viewport. */
function place(anchor: DOMRect, el: HTMLElement, preferred: Side, align: Align, offset: number, pad = 8) {
  const w = el.offsetWidth;
  const h = el.offsetHeight;
  const vw = document.documentElement.clientWidth;
  const vh = document.documentElement.clientHeight;
  const room = { top: anchor.top, bottom: vh - anchor.bottom, left: anchor.left, right: vw - anchor.right };
  let side: Side = preferred;
  const vertical0 = side === "top" || side === "bottom";
  if (room[side] < (vertical0 ? h : w) + offset + pad && room[OPPOSITE[side]] > room[side]) side = OPPOSITE[side];
  const vertical = side === "top" || side === "bottom";
  const along = (start: number, size: number, len: number) =>
    align === "start" ? start : align === "end" ? start + size - len : start + size / 2 - len / 2;
  let x = vertical ? along(anchor.left, anchor.width, w) : side === "right" ? anchor.right + offset : anchor.left - offset - w;
  let y = vertical ? (side === "bottom" ? anchor.bottom + offset : anchor.top - offset - h) : along(anchor.top, anchor.height, h);
  x = Math.min(Math.max(pad, x), vw - w - pad);
  y = Math.min(Math.max(pad, y), vh - h - pad);
  const arrow = vertical ? anchor.left + anchor.width / 2 - x : anchor.top + anchor.height / 2 - y;
  el.style.left = `${x}px`;
  el.style.top = `${y}px`;
  el.dataset.side = side;
  el.style.setProperty("--arrow", `${Math.min(Math.max(14, arrow), (vertical ? w : h) - 14)}px`);
}

type Ctx = {
  open: boolean;
  setOpen: (open: boolean) => void;
  /** Open or close after the configured delay; a later call cancels an earlier one. */
  schedule: (open: boolean) => void;
  triggerRef: RefObject<HTMLAnchorElement | null>;
  contentId: string;
};
const HoverCardContext = createContext<Ctx | null>(null);

function useHoverCard() {
  const ctx = useContext(HoverCardContext);
  if (!ctx) throw new Error("HoverCard parts must be rendered inside <HoverCard>.");
  return ctx;
}

export interface HoverCardProps {
  /** ms of hover/focus before opening. */
  openDelay?: number;
  /** ms after leaving before closing (lets the pointer travel to the card). */
  closeDelay?: number;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  children?: ReactNode;
}

export function HoverCard({ openDelay = 500, closeDelay = 250, open: openProp, defaultOpen = false, onOpenChange, children }: HoverCardProps) {
  const [inner, setInner] = useState(defaultOpen);
  const open = openProp ?? inner;
  const triggerRef = useRef<HTMLAnchorElement>(null);
  const timer = useRef(0);
  const id = useId();

  const setOpen = (next: boolean) => {
    clearTimeout(timer.current);
    if (next === open) return;
    if (openProp === undefined) setInner(next);
    onOpenChange?.(next);
  };
  const schedule = (next: boolean) => {
    clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setOpen(next), next ? openDelay : closeDelay);
  };
  useEffect(() => () => clearTimeout(timer.current), []);

  return <HoverCardContext value={{ open, setOpen, schedule, triggerRef, contentId: `${id}-card` }}>{children}</HoverCardContext>;
}

export function HoverCardTrigger({ className, onPointerEnter, onPointerLeave, onFocus, onBlur, ...props }: AnchorHTMLAttributes<HTMLAnchorElement>) {
  const { open, schedule, triggerRef, contentId } = useHoverCard();
  return (
    <a
      {...props}
      ref={triggerRef}
      aria-describedby={open ? contentId : undefined}
      onPointerEnter={(e) => {
        onPointerEnter?.(e);
        if (e.pointerType !== "touch") schedule(true);
      }}
      onPointerLeave={(e) => {
        onPointerLeave?.(e);
        if (e.pointerType !== "touch") schedule(false);
      }}
      onFocus={(e) => {
        onFocus?.(e);
        schedule(true);
      }}
      onBlur={(e) => {
        onBlur?.(e);
        schedule(false);
      }}
      className={cn(
        "rounded-sm font-medium text-foreground underline decoration-primary/40 decoration-2 underline-offset-4 outline-none transition-[text-decoration-color] hover:decoration-primary focus-visible:ring-2 focus-visible:ring-ring/60",
        className,
      )}
    />
  );
}

export interface HoverCardContentProps extends HTMLAttributes<HTMLDivElement> {
  /** Preferred side; flips automatically when there is no room. */
  side?: Side;
  align?: Align;
  sideOffset?: number;
  arrow?: boolean;
}

export function HoverCardContent({
  side = "bottom",
  align = "center",
  sideOffset = 10,
  arrow = true,
  className,
  children,
  onPointerEnter,
  onPointerLeave,
  ...props
}: HoverCardContentProps) {
  const { open, setOpen, schedule, triggerRef, contentId } = useHoverCard();
  const ref = useRef<HTMLDivElement>(null);
  const close = useRef(setOpen);
  useEffect(() => {
    close.current = setOpen;
  });

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (!open) {
      if (el.matches(":popover-open")) el.hidePopover();
      return;
    }
    if (!el.matches(":popover-open")) el.showPopover();
    const position = () => {
      const t = triggerRef.current;
      if (t) place(t.getBoundingClientRect(), el, side, align, sideOffset);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close.current(false);
    position();
    window.addEventListener("scroll", position, { capture: true, passive: true });
    window.addEventListener("resize", position);
    document.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("scroll", position, { capture: true });
      window.removeEventListener("resize", position);
      document.removeEventListener("keydown", onKey);
    };
  }, [open, side, align, sideOffset, triggerRef]);

  return (
    <div
      {...props}
      ref={ref}
      id={contentId}
      popover="manual"
      data-side={side}
      onPointerEnter={(e) => {
        onPointerEnter?.(e);
        if (e.pointerType !== "touch") schedule(true);
      }}
      onPointerLeave={(e) => {
        onPointerLeave?.(e);
        if (e.pointerType !== "touch") schedule(false);
      }}
      className={cn(
        "ui-hovercard z-50 w-72 rounded-2xl border border-border bg-popover p-4 text-sm text-popover-foreground shadow-2xl shadow-black/25 outline-none",
        className,
      )}
    >
      <style href="ui-hover-card" precedence="default">
        {css}
      </style>
      {arrow && <span aria-hidden className="ui-hovercard-arrow" />}
      {children}
    </div>
  );
}
