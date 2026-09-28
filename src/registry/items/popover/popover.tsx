"use client";

import {
  createContext,
  useContext,
  useEffect,
  useId,
  useRef,
  useState,
  type ButtonHTMLAttributes,
  type HTMLAttributes,
  type ReactNode,
  type RefObject,
} from "react";
import { cn } from "@/lib/utils";

// The content is a native `popover="auto"`: top layer (never clipped by overflow),
// light dismiss on outside click, Escape to close, and the trigger is a real
// invoker (popovertarget). CSS handles enter/exit with @starting-style.
const css = `
.ui-popover{position:fixed;inset:auto;margin:0;overflow:visible;opacity:0;scale:.94;translate:var(--from,0 0);transition:opacity .15s ease-in,scale .15s ease-in,translate .15s ease-in,display .15s allow-discrete,overlay .15s allow-discrete}
.ui-popover:popover-open{opacity:1;scale:1;translate:0 0;transition-duration:.26s;transition-timing-function:cubic-bezier(.2,.9,.3,1.12)}
@starting-style{.ui-popover:popover-open{opacity:0;scale:.94;translate:var(--from,0 0)}}
.ui-popover[data-side=bottom]{--from:0 -8px;transform-origin:var(--arrow) top}
.ui-popover[data-side=top]{--from:0 8px;transform-origin:var(--arrow) bottom}
.ui-popover[data-side=left]{--from:8px 0;transform-origin:right var(--arrow)}
.ui-popover[data-side=right]{--from:-8px 0;transform-origin:left var(--arrow)}
.ui-popover-arrow{position:absolute;width:10px;height:10px;rotate:45deg;background:inherit;border:inherit}
.ui-popover[data-side=bottom]>.ui-popover-arrow{top:-6px;left:calc(var(--arrow) - 5px);border-right:0;border-bottom:0}
.ui-popover[data-side=top]>.ui-popover-arrow{bottom:-6px;left:calc(var(--arrow) - 5px);border-left:0;border-top:0}
.ui-popover[data-side=right]>.ui-popover-arrow{left:-6px;top:calc(var(--arrow) - 5px);border-right:0;border-top:0}
.ui-popover[data-side=left]>.ui-popover-arrow{right:-6px;top:calc(var(--arrow) - 5px);border-left:0;border-bottom:0}
@media (prefers-reduced-motion:reduce){.ui-popover{transition-duration:0s!important}}
`;

type Side = "top" | "right" | "bottom" | "left";
type Align = "start" | "center" | "end";
const OPPOSITE = { top: "bottom", bottom: "top", left: "right", right: "left" } as const;
const FOCUSABLE =
  'a[href],button:not(:disabled),input:not(:disabled),select:not(:disabled),textarea:not(:disabled),[tabindex]:not([tabindex="-1"])';

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
  triggerRef: RefObject<HTMLButtonElement | null>;
  contentId: string;
};
const PopoverContext = createContext<Ctx | null>(null);

function usePopover() {
  const ctx = useContext(PopoverContext);
  if (!ctx) throw new Error("Popover parts must be rendered inside <Popover>.");
  return ctx;
}

export interface PopoverProps {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  children?: ReactNode;
}

export function Popover({ open: openProp, defaultOpen = false, onOpenChange, children }: PopoverProps) {
  const [inner, setInner] = useState(defaultOpen);
  const open = openProp ?? inner;
  const triggerRef = useRef<HTMLButtonElement>(null);
  const id = useId();
  const setOpen = (next: boolean) => {
    if (next === open) return;
    if (openProp === undefined) setInner(next);
    onOpenChange?.(next);
  };
  return <PopoverContext value={{ open, setOpen, triggerRef, contentId: `${id}-popover` }}>{children}</PopoverContext>;
}

export function PopoverTrigger({ className, ...props }: ButtonHTMLAttributes<HTMLButtonElement>) {
  const { open, triggerRef, contentId } = usePopover();
  return (
    <button
      type="button"
      ref={triggerRef}
      popoverTarget={contentId}
      aria-haspopup="dialog"
      aria-expanded={open}
      aria-controls={contentId}
      {...props}
      className={cn(
        "inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-border bg-card px-4 text-sm font-medium text-foreground shadow-sm outline-none transition-[background-color,scale] hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring/60 active:scale-[0.97] aria-expanded:bg-muted [&_svg]:size-4",
        className,
      )}
    />
  );
}

export interface PopoverContentProps extends HTMLAttributes<HTMLDivElement> {
  /** Preferred side; flips automatically when there is no room. */
  side?: Side;
  align?: Align;
  /** Gap between trigger and content in px. */
  sideOffset?: number;
  /** Show a pointer arrow toward the trigger. */
  arrow?: boolean;
}

export function PopoverContent({
  side = "bottom",
  align = "center",
  sideOffset = 10,
  arrow = true,
  className,
  children,
  ...props
}: PopoverContentProps) {
  const { open, setOpen, triggerRef, contentId } = usePopover();
  const ref = useRef<HTMLDivElement>(null);
  const opts = useRef({ side, align, sideOffset, setOpen });
  const mounted = useRef(false);
  const wasOpen = useRef(false);

  useEffect(() => {
    opts.current = { side, align, sideOffset, setOpen };
  });

  // Native toggles (invoker click, light dismiss, Escape) -> React state.
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const position = () => {
      const t = triggerRef.current;
      if (t) place(t.getBoundingClientRect(), el, opts.current.side, opts.current.align, opts.current.sideOffset);
    };
    const before = (e: Event) => {
      if ((e as ToggleEvent).newState === "open") requestAnimationFrame(position); // runs before the first painted frame
    };
    const toggle = (e: Event) => opts.current.setOpen((e as ToggleEvent).newState === "open");
    el.addEventListener("beforetoggle", before);
    el.addEventListener("toggle", toggle);
    return () => {
      el.removeEventListener("beforetoggle", before);
      el.removeEventListener("toggle", toggle);
    };
  }, [triggerRef]);

  // React state -> native popover, positioning and focus.
  useEffect(() => {
    const el = ref.current;
    const firstRun = !mounted.current;
    const opening = open && !wasOpen.current;
    const closing = !open && wasOpen.current;
    mounted.current = true;
    wasOpen.current = open;
    if (!el) return;
    const shown = el.matches(":popover-open");
    if (!open) {
      if (shown) el.hidePopover();
      if (closing && (el.contains(document.activeElement) || document.activeElement === document.body))
        triggerRef.current?.focus({ preventScroll: true });
      return;
    }
    if (!shown) el.showPopover();
    const position = () => {
      const t = triggerRef.current;
      if (t) place(t.getBoundingClientRect(), el, side, align, sideOffset);
    };
    position();
    if (opening && !firstRun)
      (el.querySelector<HTMLElement>("[autofocus]") ?? el.querySelector<HTMLElement>(FOCUSABLE) ?? el).focus({ preventScroll: true });
    window.addEventListener("scroll", position, { capture: true, passive: true });
    window.addEventListener("resize", position);
    return () => {
      window.removeEventListener("scroll", position, { capture: true });
      window.removeEventListener("resize", position);
    };
  }, [open, triggerRef, side, align, sideOffset]);

  return (
    <div
      {...props}
      ref={ref}
      id={contentId}
      popover="auto"
      role="dialog"
      tabIndex={-1}
      data-side={side}
      className={cn(
        "ui-popover z-50 w-72 rounded-xl border border-border bg-popover p-4 text-sm text-popover-foreground shadow-xl shadow-black/20 outline-none",
        className,
      )}
    >
      <style href="ui-popover" precedence="default">
        {css}
      </style>
      {arrow && <span aria-hidden className="ui-popover-arrow" />}
      {children}
    </div>
  );
}

export function PopoverClose({ onClick, ...props }: ButtonHTMLAttributes<HTMLButtonElement>) {
  const { setOpen } = usePopover();
  return (
    <button
      type="button"
      {...props}
      onClick={(e) => {
        onClick?.(e);
        if (!e.defaultPrevented) setOpen(false);
      }}
    />
  );
}
