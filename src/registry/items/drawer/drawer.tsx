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
  type KeyboardEvent,
  type ReactNode,
} from "react";
import { animate, motion, useDragControls, useMotionValue, useReducedMotion, useTransform, type PanInfo } from "motion/react";
import { cn } from "@/lib/utils";

const css = `html:has(.ui-drawer:modal){overflow:hidden}.ui-drawer::backdrop{background:transparent}`;

const FOCUSABLE =
  'a[href],button:not(:disabled),input:not(:disabled),select:not(:disabled),textarea:not(:disabled),[tabindex]:not([tabindex="-1"])';
const SPRING = { type: "spring", stiffness: 380, damping: 38, mass: 0.9 } as const;

type Ctx = {
  open: boolean;
  setOpen: (open: boolean) => void;
  position: "fixed" | "absolute";
  snapPoints: number[];
  defaultSnap: number;
  dismissible: boolean;
  ids: { trigger: string; content: string; title: string; description: string };
};
const DrawerContext = createContext<Ctx | null>(null);

function useDrawer() {
  const ctx = useContext(DrawerContext);
  if (!ctx) throw new Error("Drawer parts must be rendered inside <Drawer>.");
  return ctx;
}

export interface DrawerProps {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /**
   * `fixed` opens a true modal bottom sheet (showModal: top layer, inert page).
   * `absolute` renders inside the nearest positioned ancestor, for previews and embeds.
   */
  position?: "fixed" | "absolute";
  /** Resting heights as fractions of the sheet's height that stay visible, e.g. [0.5, 1]. */
  snapPoints?: number[];
  /** Index into snapPoints to open at. Defaults to the last (tallest). */
  defaultSnap?: number;
  /** Allow closing by dragging down, the backdrop or Escape. */
  dismissible?: boolean;
  children?: ReactNode;
}

export function Drawer({
  open: openProp,
  defaultOpen = false,
  onOpenChange,
  position = "fixed",
  snapPoints = [1],
  defaultSnap,
  dismissible = true,
  children,
}: DrawerProps) {
  const [inner, setInner] = useState(defaultOpen);
  const open = openProp ?? inner;
  const id = useId();
  const setOpen = (next: boolean) => {
    if (next === open) return;
    if (openProp === undefined) setInner(next);
    onOpenChange?.(next);
  };
  const points = [...snapPoints].sort((a, b) => a - b);
  const ids = { trigger: `${id}-trigger`, content: `${id}-content`, title: `${id}-title`, description: `${id}-desc` };
  return (
    <DrawerContext
      value={{ open, setOpen, position, snapPoints: points, defaultSnap: defaultSnap ?? points.length - 1, dismissible, ids }}
    >
      {children}
    </DrawerContext>
  );
}

const buttonBase =
  "inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-border px-4 text-sm font-medium text-foreground outline-none transition-[background-color,scale] hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring/60 active:scale-[0.97] [&_svg]:size-4";

export function DrawerTrigger({ className, onClick, ...props }: ButtonHTMLAttributes<HTMLButtonElement>) {
  const { open, setOpen, ids } = useDrawer();
  return (
    <button
      type="button"
      id={ids.trigger}
      aria-haspopup="dialog"
      aria-expanded={open}
      aria-controls={ids.content}
      {...props}
      onClick={(e) => {
        onClick?.(e);
        if (!e.defaultPrevented) setOpen(true);
      }}
      className={cn(buttonBase, "bg-card shadow-sm", className)}
    />
  );
}

export interface DrawerContentProps extends HTMLAttributes<HTMLDivElement> {
  /** Show the grab handle. */
  handle?: boolean;
}

export function DrawerContent({ handle = true, className, children, ...props }: DrawerContentProps) {
  const { open, setOpen, position, snapPoints, defaultSnap, dismissible, ids } = useDrawer();
  const modal = position === "fixed";
  const dialog = useRef<HTMLDialogElement>(null);
  const sheet = useRef<HTMLDivElement>(null);
  const returnTo = useRef<HTMLElement | null>(null);
  const mounted = useRef(false);
  const [snap, setSnap] = useState(defaultSnap);
  const reduce = useReducedMotion();
  const controls = useDragControls();
  const y = useMotionValue(0);
  const height = useMotionValue(1);
  // Backdrop fades with how much of the sheet is showing.
  const backdrop = useTransform([y, height], ([yv, hv]: number[]) => Math.min(1, Math.max(0, 1 - yv / Math.max(1, hv))));
  const target = (i: number) => (1 - (snapPoints[i] ?? 1)) * height.get();
  const settle = (i: number) => animate(y, target(i), reduce ? { duration: 0 } : SPRING);

  useEffect(() => {
    const d = dialog.current;
    const el = sheet.current;
    const firstRun = !mounted.current;
    mounted.current = true;
    if (!d || !el) return;

    if (open) {
      const opening = !d.open;
      if (opening) {
        returnTo.current = document.activeElement as HTMLElement | null;
        if (modal) d.showModal();
        else {
          d.open = true; // attribute only: no focus steal when rendered open on page load
          // preventScroll: the sheet is still translated off-screen, so a scrolling focus would shift the whole dialog.
          if (!firstRun) (d.querySelector<HTMLElement>("[autofocus]") ?? d.querySelector<HTMLElement>(FOCUSABLE))?.focus({ preventScroll: true });
        }
        d.scrollTop = 0; // undo any scroll the native autofocus caused
        height.set(el.offsetHeight);
        y.jump(el.offsetHeight); // start fully below, then spring up
      }
      const ctrl = animate(y, (1 - (snapPoints[snap] ?? 1)) * height.get(), reduce ? { duration: 0 } : SPRING);
      return () => ctrl.stop();
    }

    if (!d.open) return;
    let cancelled = false;
    const ctrl = animate(y, height.get(), reduce ? { duration: 0 } : { duration: 0.28, ease: [0.4, 0, 0.9, 0.6] });
    ctrl.then(() => {
      if (cancelled) return;
      d.close();
      setSnap(defaultSnap); // next open starts at the default height again
      const back = returnTo.current?.isConnected && returnTo.current !== document.body ? returnTo.current : document.getElementById(ids.trigger);
      back?.focus({ preventScroll: true });
    });
    return () => {
      cancelled = true;
      ctrl.stop();
    };
    // snapPoints is re-created by the parent each render; its values are covered by `snap`.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, snap, modal, reduce]);

  // Track content size changes (e.g. async content) while open.
  useEffect(() => {
    const el = sheet.current;
    if (!el) return;
    const ro = new ResizeObserver(() => height.set(el.offsetHeight));
    ro.observe(el);
    return () => ro.disconnect();
  }, [height]);

  const onDragEnd = (_: unknown, info: PanInfo) => {
    const projected = y.get() + info.velocity.y * 0.2;
    const options = snapPoints.map((_, i) => ({ i, at: target(i) }));
    if (dismissible) options.push({ i: -1, at: height.get() });
    const best = options.reduce((a, b) => (Math.abs(b.at - projected) < Math.abs(a.at - projected) ? b : a));
    if (best.i === -1) setOpen(false);
    else if (best.i === snap) settle(best.i);
    else setSnap(best.i);
  };

  const onKey = (e: KeyboardEvent<HTMLDialogElement>) => {
    if (modal) return;
    if (e.key === "Escape") {
      e.stopPropagation();
      if (dismissible) setOpen(false);
    } else if (e.key === "Tab") {
      const items = [...e.currentTarget.querySelectorAll<HTMLElement>(FOCUSABLE)];
      const first = items[0];
      const last = items[items.length - 1];
      if (document.activeElement === (e.shiftKey ? first : last)) {
        e.preventDefault();
        (e.shiftKey ? last : first)?.focus({ preventScroll: true });
      }
    }
  };

  const cycle = snapPoints.length > 1;

  return (
    <>
      <style href="ui-drawer" precedence="default">
        {css}
      </style>
      <dialog
        ref={dialog}
        id={ids.content}
        aria-labelledby={ids.title}
        aria-describedby={ids.description}
        aria-modal={modal ? undefined : true}
        onCancel={(e) => {
          e.preventDefault(); // let state drive the close so the slide-out runs
          if (dismissible) setOpen(false);
        }}
        onKeyDown={onKey}
        className={cn(
          "ui-drawer z-50 m-0 size-full max-h-none max-w-none overflow-hidden bg-transparent p-0 outline-none",
          modal ? "fixed inset-0" : "absolute inset-0",
        )}
      >
        <motion.div aria-hidden style={{ opacity: backdrop }} onClick={() => dismissible && setOpen(false)} className="absolute inset-0 bg-black/55 backdrop-blur-[3px]" />
        <motion.div
          {...(props as Record<string, unknown>)}
          ref={sheet}
          drag="y"
          dragControls={controls}
          dragListener={false}
          dragMomentum={false}
          dragConstraints={{ top: 0 }}
          dragElastic={{ top: 0.12, bottom: 1 }}
          onDragEnd={onDragEnd}
          onPointerDown={(e) => {
            // Drag from anywhere that isn't a control, so text fields and buttons behave normally.
            if (!(e.target as HTMLElement).closest("input,textarea,select,button,a,[data-no-drag]")) controls.start(e);
          }}
          style={{ y }}
          className={cn(
            "absolute inset-x-0 bottom-0 mx-auto flex max-h-[88%] w-full max-w-lg flex-col rounded-t-3xl border border-b-0 border-border bg-card text-card-foreground shadow-[0_-12px_40px_-12px_rgb(0_0_0/0.45)] outline-none",
            // Skirt below the sheet so an upward overshoot never shows a gap.
            "after:absolute after:inset-x-[-1px] after:top-full after:h-24 after:border-x after:border-border after:bg-card",
            className,
          )}
        >
          {handle && (
            <div className="grid touch-none place-items-center pt-3 pb-1">
              {cycle ? (
                <button
                  type="button"
                  aria-label="Change drawer height"
                  onClick={() => setSnap((s) => (s + 1) % snapPoints.length)}
                  className="group grid h-5 w-16 cursor-grab place-items-center rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring/60 active:cursor-grabbing"
                >
                  <span className="h-1.5 w-11 rounded-full bg-muted-foreground/35 transition-[width,background-color] duration-200 group-hover:w-14 group-hover:bg-muted-foreground/60" />
                </button>
              ) : (
                <span aria-hidden className="h-1.5 w-11 cursor-grab rounded-full bg-muted-foreground/35" />
              )}
            </div>
          )}
          <div className="min-h-0 flex-1 overflow-y-auto px-6 pt-3 pb-6">{children}</div>
        </motion.div>
      </dialog>
    </>
  );
}

export function DrawerHeader({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div {...props} className={cn("mb-5 flex cursor-grab flex-col gap-1 text-center sm:text-left", className)} />;
}

export function DrawerTitle({ className, ...props }: HTMLAttributes<HTMLHeadingElement>) {
  const { ids } = useDrawer();
  return <h2 id={ids.title} {...props} className={cn("text-lg font-semibold leading-tight tracking-tight", className)} />;
}

export function DrawerDescription({ className, ...props }: HTMLAttributes<HTMLParagraphElement>) {
  const { ids } = useDrawer();
  return <p id={ids.description} {...props} className={cn("text-sm text-muted-foreground", className)} />;
}

export function DrawerFooter({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div {...props} className={cn("mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end", className)} />;
}

export function DrawerClose({ className, onClick, ...props }: ButtonHTMLAttributes<HTMLButtonElement>) {
  const { setOpen } = useDrawer();
  return (
    <button
      type="button"
      {...props}
      onClick={(e) => {
        onClick?.(e);
        if (!e.defaultPrevented) setOpen(false);
      }}
      className={cn(buttonBase, "bg-transparent", className)}
    />
  );
}
