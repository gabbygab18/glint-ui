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

// Enter/exit is pure CSS: [open] + @starting-style for the entrance, and
// `allow-discrete` on display/overlay so the native <dialog> stays painted
// (and in the top layer) while it fades out after close().
const css = `
.ui-dialog{opacity:0;scale:.95;translate:0 10px;transition:opacity .18s ease-in,scale .18s ease-in,translate .18s ease-in,display .18s allow-discrete,overlay .18s allow-discrete}
.ui-dialog[open]{opacity:1;scale:1;translate:0 0;transition-timing-function:cubic-bezier(.2,.9,.25,1.15);transition-duration:.28s}
@starting-style{.ui-dialog[open]{opacity:0;scale:.95;translate:0 10px}}
.ui-dialog::backdrop{background:rgb(0 0 0/0);backdrop-filter:blur(0);transition:background .25s,backdrop-filter .25s,display .25s allow-discrete,overlay .25s allow-discrete}
.ui-dialog[open]::backdrop{background:rgb(0 0 0/.5);backdrop-filter:blur(6px)}
@starting-style{.ui-dialog[open]::backdrop{background:rgb(0 0 0/0);backdrop-filter:blur(0)}}
html:has(.ui-dialog:modal){overflow:hidden}
@media (prefers-reduced-motion:reduce){.ui-dialog,.ui-dialog::backdrop{transition-duration:0s!important}}
`;

const FOCUSABLE =
  'a[href],button:not(:disabled),input:not(:disabled),select:not(:disabled),textarea:not(:disabled),[tabindex]:not([tabindex="-1"])';

type Ctx = {
  open: boolean;
  setOpen: (open: boolean) => void;
  position: "fixed" | "absolute";
  ids: { trigger: string; content: string; title: string; description: string };
};
const DialogContext = createContext<Ctx | null>(null);

function useDialog() {
  const ctx = useContext(DialogContext);
  if (!ctx) throw new Error("Dialog parts must be rendered inside <Dialog>.");
  return ctx;
}

export interface DialogProps {
  /** Controlled open state. */
  open?: boolean;
  /** Initial open state when uncontrolled. */
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /**
   * `fixed` opens a true modal (showModal: top layer, inert page, native ::backdrop).
   * `absolute` renders inside the nearest positioned ancestor, for previews and embeds.
   */
  position?: "fixed" | "absolute";
  children?: ReactNode;
}

export function Dialog({ open: openProp, defaultOpen = false, onOpenChange, position = "fixed", children }: DialogProps) {
  const [inner, setInner] = useState(defaultOpen);
  const open = openProp ?? inner;
  const id = useId();
  const setOpen = (next: boolean) => {
    if (openProp === undefined) setInner(next);
    onOpenChange?.(next);
  };
  const ids = { trigger: `${id}-trigger`, content: `${id}-content`, title: `${id}-title`, description: `${id}-desc` };
  return <DialogContext value={{ open, setOpen, position, ids }}>{children}</DialogContext>;
}

export function DialogTrigger({ className, onClick, ...props }: ButtonHTMLAttributes<HTMLButtonElement>) {
  const { open, setOpen, ids } = useDialog();
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

export interface DialogContentProps extends HTMLAttributes<HTMLDialogElement> {
  /** Render the corner close button. */
  showClose?: boolean;
  /** Close when the backdrop is clicked. */
  dismissible?: boolean;
}

export function DialogContent({
  className,
  children,
  showClose = true,
  dismissible = true,
  onKeyDown,
  ...props
}: DialogContentProps) {
  const { open, setOpen, position, ids } = useDialog();
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
      if (modal) {
        d.showModal(); // native: moves focus inside, makes the page inert, handles Escape
      } else {
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
    // Non-modal (absolute) mode: emulate Escape + a Tab focus trap ourselves.
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
      <style href="ui-dialog" precedence="default">
        {css}
      </style>
      {!modal && (
        <div
          aria-hidden
          onClick={() => dismissible && setOpen(false)}
          className={cn(
            "absolute inset-0 z-40 bg-black/50 backdrop-blur-[6px] transition-opacity duration-250 motion-reduce:transition-none",
            open ? "opacity-100" : "pointer-events-none opacity-0",
          )}
        />
      )}
      <dialog
        {...props}
        ref={ref}
        id={ids.content}
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
          "ui-dialog z-50 m-auto h-fit max-h-[calc(100%-2rem)] w-[calc(100%-2rem)] max-w-md overflow-y-auto rounded-2xl border border-border bg-card p-6 text-card-foreground shadow-2xl outline-none",
          modal ? "fixed inset-0" : "absolute inset-0",
          className,
        )}
      >
        {children}
        {showClose && (
          <button
            type="button"
            aria-label="Close"
            onClick={() => setOpen(false)}
            className="absolute right-4 top-4 grid size-8 place-items-center rounded-full text-muted-foreground outline-none transition-[background-color,color,rotate] duration-200 hover:rotate-90 hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/60 motion-reduce:transition-none"
          >
            <X className="size-4" />
          </button>
        )}
      </dialog>
    </>
  );
}

export function DialogHeader({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div {...props} className={cn("mb-5 flex flex-col gap-1.5 pr-8", className)} />;
}

export function DialogTitle({ className, ...props }: HTMLAttributes<HTMLHeadingElement>) {
  const { ids } = useDialog();
  return <h2 id={ids.title} {...props} className={cn("text-lg font-semibold leading-tight tracking-tight", className)} />;
}

export function DialogDescription({ className, ...props }: HTMLAttributes<HTMLParagraphElement>) {
  const { ids } = useDialog();
  return <p id={ids.description} {...props} className={cn("text-sm text-muted-foreground", className)} />;
}

export function DialogFooter({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div {...props} className={cn("mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end", className)} />;
}

export function DialogClose({ className, onClick, ...props }: ButtonHTMLAttributes<HTMLButtonElement>) {
  const { setOpen } = useDialog();
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
