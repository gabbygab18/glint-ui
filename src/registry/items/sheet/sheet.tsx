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
  type MouseEvent,
  type ReactNode,
} from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

// Native <dialog> slides in from its side. [open] + @starting-style drive the entrance,
// allow-discrete on display/overlay keeps it painted (and in the top layer) while it
// slides back out after close(). Children fade up slightly after the panel lands.
const css = `
.ui-sheet{--ui-sheet-off:translate(100%,0);transform:var(--ui-sheet-off);transition:transform .25s cubic-bezier(.4,0,1,1),display .25s allow-discrete,overlay .25s allow-discrete}
.ui-sheet[data-side=left]{--ui-sheet-off:translate(-100%,0)}
.ui-sheet[data-side=top]{--ui-sheet-off:translate(0,-100%)}
.ui-sheet[data-side=bottom]{--ui-sheet-off:translate(0,100%)}
.ui-sheet[open]{transform:none;transition-duration:.45s;transition-timing-function:cubic-bezier(.16,1,.3,1)}
@starting-style{.ui-sheet[open]{transform:var(--ui-sheet-off)}}
@keyframes ui-sheet-body{from{opacity:0;translate:0 8px}}
.ui-sheet[open]>.ui-sheet-body>*{animation:ui-sheet-body .45s cubic-bezier(.16,1,.3,1) both}
.ui-sheet[open]>.ui-sheet-body>:nth-child(2){animation-delay:.06s}
.ui-sheet[open]>.ui-sheet-body>:nth-child(3){animation-delay:.12s}
.ui-sheet[open]>.ui-sheet-body>:nth-child(n+4){animation-delay:.18s}
.ui-sheet::backdrop{background:rgb(0 0 0/0);backdrop-filter:blur(0);transition:background .3s,backdrop-filter .3s,display .3s allow-discrete,overlay .3s allow-discrete}
.ui-sheet[open]::backdrop{background:rgb(0 0 0/.5);backdrop-filter:blur(4px)}
@starting-style{.ui-sheet[open]::backdrop{background:rgb(0 0 0/0);backdrop-filter:blur(0)}}
html:has(.ui-sheet:modal){overflow:hidden}
@media (prefers-reduced-motion:reduce){.ui-sheet,.ui-sheet::backdrop{transition-duration:0s!important}.ui-sheet-body>*{animation:none!important}}
`;

const FOCUSABLE =
  'a[href],button:not(:disabled),input:not(:disabled),select:not(:disabled),textarea:not(:disabled),[tabindex]:not([tabindex="-1"])';

export type SheetSide = "top" | "right" | "bottom" | "left";

type Ctx = {
  open: boolean;
  setOpen: (open: boolean) => void;
  position: "fixed" | "absolute";
  ids: { trigger: string; content: string; title: string; description: string };
};
const SheetContext = createContext<Ctx | null>(null);

function useSheet() {
  const ctx = useContext(SheetContext);
  if (!ctx) throw new Error("Sheet parts must be rendered inside <Sheet>.");
  return ctx;
}

export interface SheetProps {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /**
   * `fixed` opens a true modal (showModal: top layer, inert page, native ::backdrop).
   * `absolute` slides within the nearest positioned ancestor, for previews and embeds.
   */
  position?: "fixed" | "absolute";
  children?: ReactNode;
}

export function Sheet({ open: openProp, defaultOpen = false, onOpenChange, position = "fixed", children }: SheetProps) {
  const [inner, setInner] = useState(defaultOpen);
  const open = openProp ?? inner;
  const id = useId();
  const setOpen = (next: boolean) => {
    if (openProp === undefined) setInner(next);
    onOpenChange?.(next);
  };
  const ids = { trigger: `${id}-trigger`, content: `${id}-content`, title: `${id}-title`, description: `${id}-desc` };
  return <SheetContext value={{ open, setOpen, position, ids }}>{children}</SheetContext>;
}

export function SheetTrigger({ className, onClick, ...props }: ButtonHTMLAttributes<HTMLButtonElement>) {
  const { open, setOpen, ids } = useSheet();
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
      className={cn(
        "inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-border bg-card px-4 text-sm font-medium text-foreground shadow-sm outline-none transition-[background-color,scale] hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring/60 active:scale-[0.97]",
        className,
      )}
    />
  );
}

const sideClass: Record<SheetSide, string> = {
  right: "inset-y-0 right-0 left-auto h-full w-3/4 max-w-sm border-l",
  left: "inset-y-0 left-0 right-auto h-full w-3/4 max-w-sm border-r",
  top: "inset-x-0 top-0 bottom-auto h-auto max-h-[85%] w-full border-b",
  bottom: "inset-x-0 bottom-0 top-auto h-auto max-h-[85%] w-full border-t",
};

export interface SheetContentProps extends HTMLAttributes<HTMLDialogElement> {
  side?: SheetSide;
  /** Render the corner close button. */
  showClose?: boolean;
  /** Close when the backdrop is clicked. */
  dismissible?: boolean;
}

export function SheetContent({
  side = "right",
  showClose = true,
  dismissible = true,
  className,
  children,
  onKeyDown,
  ...props
}: SheetContentProps) {
  const { open, setOpen, position, ids } = useSheet();
  const ref = useRef<HTMLDialogElement>(null);
  const returnTo = useRef<HTMLElement | null>(null);
  const mounted = useRef(false);
  const downOutside = useRef(false);
  const modal = position === "fixed";

  useEffect(() => {
    const d = ref.current;
    const firstRun = !mounted.current;
    mounted.current = true;
    if (!d) return;
    if (open && !d.open) {
      returnTo.current = document.activeElement as HTMLElement | null;
      if (modal) d.showModal();
      else {
        d.open = true; // attribute only: no focus steal when rendered open on page load
        if (!firstRun) (d.querySelector<HTMLElement>("[autofocus]") ?? d.querySelector<HTMLElement>(FOCUSABLE))?.focus();
      }
    } else if (!open && d.open) {
      d.close();
      const back = returnTo.current?.isConnected && returnTo.current !== document.body ? returnTo.current : document.getElementById(ids.trigger);
      back?.focus({ preventScroll: true });
    }
  }, [open, modal, ids.trigger]);

  const outside = (e: MouseEvent<HTMLDialogElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    return e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom;
  };

  const onKey = (e: KeyboardEvent<HTMLDialogElement>) => {
    onKeyDown?.(e);
    if (modal || e.defaultPrevented) return;
    // Contained mode is not a real modal: emulate Escape and a Tab focus trap.
    if (e.key === "Escape") {
      e.stopPropagation();
      setOpen(false);
    } else if (e.key === "Tab") {
      const items = [...e.currentTarget.querySelectorAll<HTMLElement>(FOCUSABLE)];
      const first = items[0];
      const last = items[items.length - 1];
      if (document.activeElement === (e.shiftKey ? first : last)) {
        e.preventDefault();
        (e.shiftKey ? last : first)?.focus();
      }
    }
  };

  return (
    <>
      <style href="ui-sheet" precedence="default">
        {css}
      </style>
      {!modal && (
        <div
          aria-hidden
          onClick={() => dismissible && setOpen(false)}
          className={cn(
            "absolute inset-0 z-40 bg-black/50 backdrop-blur-[4px] transition-opacity duration-300 motion-reduce:transition-none",
            open ? "opacity-100" : "pointer-events-none opacity-0",
          )}
        />
      )}
      <dialog
        {...props}
        ref={ref}
        id={ids.content}
        data-side={side}
        aria-labelledby={ids.title}
        aria-describedby={ids.description}
        aria-modal={modal ? undefined : true}
        onCancel={(e) => {
          e.preventDefault(); // let state drive the close so the exit animation runs
          setOpen(false);
        }}
        onClose={() => open && setOpen(false)}
        onKeyDown={onKey}
        onPointerDown={(e) => (downOutside.current = outside(e))}
        onClick={(e) => {
          if (dismissible && modal && downOutside.current && outside(e)) setOpen(false);
          downOutside.current = false;
        }}
        className={cn(
          "ui-sheet z-50 m-0 max-h-none max-w-none overflow-hidden border-border bg-card p-0 text-card-foreground shadow-2xl outline-none",
          modal ? "fixed" : "absolute",
          sideClass[side],
          className,
        )}
      >
        <div className="ui-sheet-body flex h-full max-h-[inherit] flex-col gap-4 overflow-y-auto p-6">{children}</div>
        {showClose && (
          <button
            type="button"
            aria-label="Close"
            onClick={() => setOpen(false)}
            className="absolute top-4 right-4 grid size-8 place-items-center rounded-full text-muted-foreground outline-none transition-[background-color,color,rotate] duration-200 hover:rotate-90 hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/60 motion-reduce:transition-none"
          >
            <X className="size-4" />
          </button>
        )}
      </dialog>
    </>
  );
}

export function SheetHeader({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div {...props} className={cn("flex flex-col gap-1.5 pr-8", className)} />;
}

export function SheetTitle({ className, ...props }: HTMLAttributes<HTMLHeadingElement>) {
  const { ids } = useSheet();
  return <h2 id={ids.title} {...props} className={cn("text-lg font-semibold leading-tight tracking-tight", className)} />;
}

export function SheetDescription({ className, ...props }: HTMLAttributes<HTMLParagraphElement>) {
  const { ids } = useSheet();
  return <p id={ids.description} {...props} className={cn("text-sm text-muted-foreground", className)} />;
}

export function SheetFooter({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div {...props} className={cn("mt-auto flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end", className)} />;
}

export function SheetClose({ className, onClick, ...props }: ButtonHTMLAttributes<HTMLButtonElement>) {
  const { setOpen } = useSheet();
  return (
    <button
      type="button"
      {...props}
      onClick={(e) => {
        onClick?.(e);
        if (!e.defaultPrevented) setOpen(false);
      }}
      className={cn(
        "inline-flex h-10 items-center justify-center rounded-lg border border-border bg-transparent px-4 text-sm font-medium text-foreground outline-none transition-[background-color,scale] hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring/60 active:scale-[0.97]",
        className,
      )}
    />
  );
}
