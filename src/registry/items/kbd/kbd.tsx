"use client";

import { Children, Fragment, useEffect, useState, type HTMLAttributes, type ReactNode } from "react";
import { cn } from "@/lib/utils";

export type KbdSize = "sm" | "md" | "lg";

// Symbols and names people write on keycaps, mapped to KeyboardEvent.key.
const ALIASES: Record<string, string> = {
  "⌘": "Meta", cmd: "Meta", command: "Meta", meta: "Meta", win: "Meta",
  "⌃": "Control", ctrl: "Control", control: "Control",
  "⌥": "Alt", opt: "Alt", option: "Alt", alt: "Alt",
  "⇧": "Shift", shift: "Shift",
  "↵": "Enter", "⏎": "Enter", enter: "Enter", return: "Enter",
  "⎋": "Escape", esc: "Escape", escape: "Escape",
  "⌫": "Backspace", backspace: "Backspace", "⌦": "Delete", del: "Delete",
  "⇥": "Tab", tab: "Tab",
  "␣": " ", space: " ",
  "↑": "ArrowUp", "↓": "ArrowDown", "←": "ArrowLeft", "→": "ArrowRight",
};

function toKey(label: string) {
  const l = label.trim();
  if (l.toLowerCase() === "mod") return /Mac|iPhone|iPad/.test(navigator.platform) ? "Meta" : "Control";
  return (ALIASES[l] ?? ALIASES[l.toLowerCase()] ?? l).toLowerCase();
}

const sizes: Record<KbdSize, string> = {
  sm: "h-5 min-w-5 rounded-[5px] px-1 text-[10px] [--depth:2px]",
  md: "h-7 min-w-7 rounded-md px-1.5 text-xs [--depth:3px]",
  lg: "h-10 min-w-10 rounded-lg px-2.5 text-sm [--depth:4px]",
};

export interface KbdProps extends HTMLAttributes<HTMLElement> {
  size?: KbdSize;
  /** Animate a press when the matching physical key goes down. */
  listen?: boolean;
  /** KeyboardEvent.key to react to. Defaults to the text content ("⌘", "Shift", "K", "Mod"...). */
  match?: string;
  /** Force the pressed look (controlled). */
  pressed?: boolean;
}

export function Kbd({ size = "md", listen = true, match, pressed, className, children, ...props }: KbdProps) {
  const [down, setDown] = useState(false);
  const label = match ?? (typeof children === "string" ? children : undefined);

  useEffect(() => {
    if (!listen || !label) return;
    const key = toKey(label);
    // Passive observers only: never preventDefault, so page shortcuts keep working.
    const on = (e: KeyboardEvent) => e.key.toLowerCase() === key && setDown(true);
    const off = (e: KeyboardEvent) => e.key.toLowerCase() === key && setDown(false);
    const reset = () => setDown(false);
    window.addEventListener("keydown", on);
    window.addEventListener("keyup", off);
    window.addEventListener("blur", reset);
    return () => {
      window.removeEventListener("keydown", on);
      window.removeEventListener("keyup", off);
      window.removeEventListener("blur", reset);
    };
  }, [listen, label]);

  const isDown = pressed ?? down;

  return (
    <kbd
      {...props}
      data-pressed={isDown || undefined}
      className={cn(
        "relative inline-flex select-none items-center justify-center border border-border bg-linear-to-b from-card to-muted font-sans font-medium text-foreground",
        // The key's "side" is a hard shadow; pressing sinks the cap into it.
        "[--side:color-mix(in_oklab,var(--muted-foreground)_40%,var(--background))] shadow-[0_var(--depth)_0_0_var(--side),0_calc(var(--depth)+2px)_6px_-2px_rgb(0_0_0/0.35),inset_0_1px_0_rgb(255_255_255/0.08)]",
        "transition-[translate,box-shadow,background-color,border-color] duration-100 ease-out motion-reduce:transition-none",
        "data-pressed:translate-y-(--depth) data-pressed:border-primary/60 data-pressed:bg-muted data-pressed:shadow-[0_0_0_0_var(--side),0_0_0_3px_color-mix(in_oklab,var(--primary)_22%,transparent),inset_0_1px_2px_rgb(0_0_0/0.25)]",
        sizes[size],
        className,
      )}
    >
      {children}
    </kbd>
  );
}

export interface KbdGroupProps extends HTMLAttributes<HTMLSpanElement> {
  /** Rendered between keys, e.g. "+" or "then". */
  separator?: ReactNode;
}

export function KbdGroup({ separator, className, children, ...props }: KbdGroupProps) {
  const keys = Children.toArray(children);
  return (
    <span {...props} className={cn("inline-flex items-center gap-1.5", className)}>
      {keys.map((k, i) => (
        <Fragment key={i}>
          {i > 0 && separator != null && (
            <span aria-hidden className="text-xs text-muted-foreground">
              {separator}
            </span>
          )}
          {k}
        </Fragment>
      ))}
    </span>
  );
}
