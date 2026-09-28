"use client";

import { useEffect, useId, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import { Loader2, TriangleAlert } from "lucide-react";
import { cn } from "@/lib/utils";

// Enter/exit is pure CSS on the native <dialog>: [open] + @starting-style for the
// entrance and `allow-discrete` on display/overlay to keep it painted while it fades out.
const css = `
.ui-alert{opacity:0;scale:.94;transition:opacity .16s ease-in,scale .16s ease-in,display .16s allow-discrete,overlay .16s allow-discrete}
.ui-alert[open]{opacity:1;scale:1;transition-timing-function:cubic-bezier(.2,.9,.25,1.2);transition-duration:.26s}
@starting-style{.ui-alert[open]{opacity:0;scale:.94}}
.ui-alert::backdrop{background:rgb(0 0 0/0);backdrop-filter:blur(0);transition:background .22s,backdrop-filter .22s,display .22s allow-discrete,overlay .22s allow-discrete}
.ui-alert[open]::backdrop{background:rgb(0 0 0/.55);backdrop-filter:blur(4px)}
@starting-style{.ui-alert[open]::backdrop{background:rgb(0 0 0/0);backdrop-filter:blur(0)}}
html:has(.ui-alert:modal){overflow:hidden}
@media (prefers-reduced-motion:reduce){.ui-alert,.ui-alert::backdrop{transition-duration:0s!important}}
`;

const btn =
  "inline-flex h-10 items-center justify-center gap-2 rounded-lg px-4 text-sm font-medium outline-none transition-[background-color,scale,opacity] focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-card active:scale-[0.97] disabled:pointer-events-none disabled:opacity-60";

export interface AlertDialogProps {
  title: ReactNode;
  description?: ReactNode;
  /** Label of the built-in trigger button. Omit to control the dialog yourself via `open`. */
  trigger?: ReactNode;
  confirmLabel?: ReactNode;
  cancelLabel?: ReactNode;
  /** Red confirm button, warning icon and red trigger. */
  destructive?: boolean;
  /** Return a promise to show a spinner and keep the dialog open until it resolves. */
  onConfirm?: () => void | Promise<unknown>;
  onCancel?: () => void;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** `fixed` = true modal via showModal(); `absolute` = contained in the nearest positioned parent. */
  position?: "fixed" | "absolute";
  className?: string;
}

export function AlertDialog({
  title,
  description,
  trigger,
  confirmLabel = "Continue",
  cancelLabel = "Cancel",
  destructive = false,
  onConfirm,
  onCancel,
  open: openProp,
  defaultOpen = false,
  onOpenChange,
  position = "fixed",
  className,
}: AlertDialogProps) {
  const [inner, setInner] = useState(defaultOpen);
  const [busy, setBusy] = useState(false);
  const open = openProp ?? inner;
  const modal = position === "fixed";
  const ref = useRef<HTMLDialogElement>(null);
  const cancelRef = useRef<HTMLButtonElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const returnTo = useRef<HTMLElement | null>(null);
  const mounted = useRef(false);
  const id = useId();

  const setOpen = (next: boolean) => {
    if (openProp === undefined) setInner(next);
    onOpenChange?.(next);
  };

  useEffect(() => {
    const d = ref.current;
    const firstRun = !mounted.current;
    mounted.current = true;
    if (!d) return;
    if (open && !d.open) {
      returnTo.current = document.activeElement as HTMLElement | null;
      if (modal) d.showModal();
      else d.open = true; // attribute only: no focus steal when rendered open on page load
      // WAI-ARIA alertdialog: start on the least destructive action.
      if (modal || !firstRun) cancelRef.current?.focus();
    } else if (!open && d.open) {
      d.close();
      const back = returnTo.current?.isConnected && returnTo.current !== document.body ? returnTo.current : triggerRef.current;
      back?.focus({ preventScroll: true });
    }
  }, [open, modal]);

  const cancel = () => {
    if (busy) return;
    onCancel?.();
    setOpen(false);
  };

  const confirm = async () => {
    const result = onConfirm?.();
    if (result instanceof Promise) {
      setBusy(true);
      try {
        await result;
        setOpen(false);
      } catch {
        // Stay open so the user can retry.
      } finally {
        setBusy(false);
      }
    } else setOpen(false);
  };

  // Clicking outside an alert dialog must not dismiss it: nudge it instead.
  const nudge = () => {
    cancelRef.current?.focus({ preventScroll: true });
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    ref.current?.animate([{ scale: 1 }, { scale: 1.03 }, { scale: 1 }], { duration: 220, easing: "ease-out" });
  };

  const onKey = (e: KeyboardEvent<HTMLDialogElement>) => {
    if (modal) return;
    // Non-modal (absolute) mode: emulate Escape and trap Tab between the two buttons.
    if (e.key === "Escape") {
      e.stopPropagation();
      cancel();
    } else if (e.key === "Tab") {
      const items = [...e.currentTarget.querySelectorAll<HTMLElement>("button:not(:disabled)")];
      const edge = e.shiftKey ? items[0] : items[items.length - 1];
      if (document.activeElement === edge) {
        e.preventDefault();
        (e.shiftKey ? items[items.length - 1] : items[0])?.focus();
      }
    }
  };

  const tone = destructive
    ? "bg-destructive text-white hover:bg-destructive/90 focus-visible:ring-destructive/60"
    : "bg-primary text-primary-foreground hover:bg-primary/90 focus-visible:ring-ring/60";

  return (
    <>
      <style href="ui-alert-dialog" precedence="default">
        {css}
      </style>
      {trigger !== undefined && (
        <button
          ref={triggerRef}
          type="button"
          aria-haspopup="dialog"
          aria-expanded={open}
          aria-controls={id}
          onClick={() => setOpen(true)}
          className={cn(
            btn,
            destructive
              ? "border border-destructive/40 bg-destructive/10 text-destructive hover:bg-destructive/15 focus-visible:ring-destructive/60"
              : "border border-border bg-card text-foreground hover:bg-muted focus-visible:ring-ring/60",
          )}
        >
          {trigger}
        </button>
      )}
      {!modal && (
        <div
          aria-hidden
          onClick={nudge}
          className={cn(
            "absolute inset-0 z-40 bg-black/55 backdrop-blur-[4px] transition-opacity duration-200 motion-reduce:transition-none",
            open ? "opacity-100" : "pointer-events-none opacity-0",
          )}
        />
      )}
      <dialog
        ref={ref}
        id={id}
        role="alertdialog"
        aria-modal={modal ? undefined : true}
        aria-labelledby={`${id}-t`}
        aria-describedby={description ? `${id}-d` : undefined}
        onCancel={(e) => {
          e.preventDefault(); // state drives the close so the exit animation runs
          cancel();
        }}
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            const r = e.currentTarget.getBoundingClientRect();
            if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) nudge();
          }
        }}
        onKeyDown={onKey}
        className={cn(
          "ui-alert z-50 m-auto h-fit w-[calc(100%-2rem)] max-w-md rounded-2xl border border-border bg-card p-6 text-card-foreground shadow-2xl outline-none",
          modal ? "fixed inset-0" : "absolute inset-0",
          className,
        )}
      >
        <div className="flex gap-4">
          {destructive && (
            <span aria-hidden className="grid size-10 shrink-0 place-items-center rounded-full bg-destructive/15 text-destructive">
              <TriangleAlert className="size-5" />
            </span>
          )}
          <div className="grid gap-1.5">
            <h2 id={`${id}-t`} className="text-lg font-semibold leading-tight tracking-tight">
              {title}
            </h2>
            {description && (
              <p id={`${id}-d`} className="text-sm leading-relaxed text-muted-foreground">
                {description}
              </p>
            )}
          </div>
        </div>
        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button
            ref={cancelRef}
            type="button"
            onClick={cancel}
            disabled={busy}
            className={cn(btn, "border border-border bg-transparent text-foreground hover:bg-muted focus-visible:ring-ring/60")}
          >
            {cancelLabel}
          </button>
          <button type="button" onClick={confirm} disabled={busy} aria-busy={busy} className={cn(btn, tone)}>
            {busy && <Loader2 aria-hidden className="size-4 animate-spin" />}
            {confirmLabel}
          </button>
        </div>
      </dialog>
    </>
  );
}
