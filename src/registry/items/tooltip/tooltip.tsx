"use client";

import {
  cloneElement,
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactElement,
  type ReactNode,
} from "react";
import { cn } from "@/lib/utils";

// The bubble is a native `popover="manual"` element, so it renders in the top layer and
// is never clipped by overflow:hidden parents. Enter/exit mirrors the dialog: :popover-open
// + @starting-style, with allow-discrete keeping it painted while it fades out.
const css = `
.ui-tip{opacity:0;scale:.9;translate:var(--tip-dx) var(--tip-dy);transition:opacity .12s ease-in,scale .12s ease-in,translate .12s ease-in,display .12s allow-discrete,overlay .12s allow-discrete}
.ui-tip:popover-open{opacity:1;scale:1;translate:0 0;transition-duration:.2s;transition-timing-function:cubic-bezier(.2,.9,.3,1.2)}
@starting-style{.ui-tip:popover-open{opacity:0;scale:.9;translate:var(--tip-dx) var(--tip-dy)}}
@media (prefers-reduced-motion:reduce){.ui-tip{transition-property:opacity,display,overlay;scale:1;translate:0 0}}
`;

export type TooltipSide = "top" | "right" | "bottom" | "left";

const nudge: Record<TooltipSide, [string, string]> = {
  top: ["0px", "4px"],
  bottom: ["0px", "-4px"],
  left: ["4px", "0px"],
  right: ["-4px", "0px"],
};
const opposite: Record<TooltipSide, TooltipSide> = { top: "bottom", bottom: "top", left: "right", right: "left" };

// Tooltips opened shortly after another one closed skip the delay (moving along a toolbar),
// and only one tooltip is open at a time.
let lastClosed = 0;
let closeCurrent: (() => void) | null = null;

export interface TooltipProps {
  /** Tooltip text or node. Keep it short; it is exposed as the trigger's description. */
  content: ReactNode;
  /** The trigger. Must be a single focusable element (button, link...). */
  children: ReactElement<{ "aria-describedby"?: string }>;
  /** Preferred side; flips to the opposite side when there is no room. */
  side?: TooltipSide;
  /** Gap between trigger and bubble, px. */
  sideOffset?: number;
  /** Hover delay before opening, ms. Keyboard focus opens immediately. */
  delay?: number;
  /** Render the little arrow. */
  arrow?: boolean;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  className?: string;
}

export function Tooltip({
  content,
  children,
  side = "top",
  sideOffset = 8,
  delay = 500,
  arrow = true,
  open: openProp,
  defaultOpen = false,
  onOpenChange,
  className,
}: TooltipProps) {
  const [inner, setInner] = useState(defaultOpen);
  const open = openProp ?? inner;
  const [placed, setPlaced] = useState<TooltipSide>(side);
  const id = useId();
  const anchor = useRef<HTMLSpanElement>(null);
  const tip = useRef<HTMLDivElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  const setOpen = useCallback(
    (next: boolean) => {
      clearTimeout(timer.current);
      if (!next && open) lastClosed = Date.now();
      if (openProp === undefined) setInner(next);
      onOpenChange?.(next);
    },
    [open, openProp, onOpenChange],
  );

  const show = (wait: number) => {
    clearTimeout(timer.current);
    if (wait <= 0 || closeCurrent || Date.now() - lastClosed < 300) setOpen(true);
    else timer.current = setTimeout(() => setOpen(true), wait);
  };
  const hide = () => {
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setOpen(false), 100); // grace period to move onto the bubble
  };

  useEffect(() => () => clearTimeout(timer.current), []);

  // Position against the trigger (fixed coords, top layer), flip if it would overflow, clamp to viewport.
  const place = useCallback(() => {
    const a = anchor.current?.getBoundingClientRect();
    const t = tip.current;
    if (!a || !t) return;
    const w = t.offsetWidth;
    const h = t.offsetHeight;
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const fits = (s: TooltipSide) =>
      s === "top" ? a.top - sideOffset - h >= 0 : s === "bottom" ? a.bottom + sideOffset + h <= vh : s === "left" ? a.left - sideOffset - w >= 0 : a.right + sideOffset + w <= vw;
    const s = fits(side) || !fits(opposite[side]) ? side : opposite[side];
    let x = s === "left" ? a.left - sideOffset - w : s === "right" ? a.right + sideOffset : a.left + a.width / 2 - w / 2;
    let y = s === "top" ? a.top - sideOffset - h : s === "bottom" ? a.bottom + sideOffset : a.top + a.height / 2 - h / 2;
    x = Math.min(Math.max(x, 4), vw - w - 4);
    y = Math.min(Math.max(y, 4), vh - h - 4);
    t.style.left = `${x}px`;
    t.style.top = `${y}px`;
    // Arrow keeps pointing at the trigger's center even after clamping.
    t.style.setProperty("--tip-ax", `${a.left + a.width / 2 - x}px`);
    t.style.setProperty("--tip-ay", `${a.top + a.height / 2 - y}px`);
    setPlaced(s);
  }, [side, sideOffset]);

  useLayoutEffect(() => {
    const t = tip.current;
    if (!t?.showPopover) return;
    if (open) {
      if (!t.matches(":popover-open")) t.showPopover();
      const close = () => setOpen(false);
      if (closeCurrent !== close) closeCurrent?.();
      closeCurrent = close;
      place();
      window.addEventListener("scroll", place, true);
      window.addEventListener("resize", place);
      const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
      document.addEventListener("keydown", onKey);
      return () => {
        window.removeEventListener("scroll", place, true);
        window.removeEventListener("resize", place);
        document.removeEventListener("keydown", onKey);
        if (closeCurrent === close) closeCurrent = null;
      };
    }
    if (t.matches(":popover-open")) t.hidePopover();
  }, [open, place, setOpen]);

  const [dx, dy] = nudge[placed];
  const vertical = placed === "top" || placed === "bottom";

  return (
    <span
      ref={anchor}
      className="inline-flex"
      onPointerEnter={(e) => e.pointerType === "mouse" && show(delay)}
      onPointerLeave={(e) => e.pointerType === "mouse" && hide()}
      onFocus={(e) => e.target.matches(":focus-visible") && show(0)}
      onBlur={() => setOpen(false)}
      onPointerDown={() => setOpen(false)}
    >
      <style href="ui-tooltip" precedence="default">
        {css}
      </style>
      {cloneElement(children, {
        "aria-describedby": cn(children.props["aria-describedby"], id) || undefined,
      })}
      <div
        ref={tip}
        id={id}
        role="tooltip"
        popover="manual"
        data-side={placed}
        style={{ "--tip-dx": dx, "--tip-dy": dy, transformOrigin: `var(--tip-ax) var(--tip-ay)` } as CSSProperties}
        className={cn(
          "ui-tip fixed inset-auto m-0 w-max max-w-64 overflow-visible rounded-md border-0 bg-foreground px-2.5 py-1.5 text-xs leading-snug font-medium text-background shadow-lg",
          className,
        )}
      >
        {content}
        {arrow && (
          <span
            aria-hidden
            className={cn(
              "absolute size-2 rotate-45 rounded-[1px] bg-inherit",
              placed === "top" && "-bottom-1",
              placed === "bottom" && "-top-1",
              placed === "left" && "-right-1",
              placed === "right" && "-left-1",
            )}
            style={vertical ? { left: "calc(var(--tip-ax) - 4px)" } : { top: "calc(var(--tip-ay) - 4px)" }}
          />
        )}
      </div>
    </span>
  );
}
