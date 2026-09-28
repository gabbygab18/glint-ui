"use client";

import { Bold, Italic, Link2, List, Strikethrough, Underline } from "lucide-react";
import { Tooltip } from "./tooltip";

const tools = [
  { icon: Bold, label: "Bold", keys: "Ctrl B" },
  { icon: Italic, label: "Italic", keys: "Ctrl I" },
  { icon: Underline, label: "Underline", keys: "Ctrl U" },
  { icon: Strikethrough, label: "Strikethrough", keys: "Ctrl Shift X" },
  { icon: List, label: "Bulleted list", keys: "Ctrl Shift 8" },
];

const btn =
  "grid size-9 place-items-center rounded-lg text-muted-foreground outline-none transition-colors hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/60";

const tip = (label: string, keys: string) => (
  <span className="flex items-center gap-2">
    {label}
    <kbd className="rounded bg-background/15 px-1 font-sans text-[10px] opacity-70">{keys}</kbd>
  </span>
);

export default function Demo(p: Record<string, unknown>) {
  return (
    <div className="flex items-center gap-1 rounded-xl border border-border bg-card p-1.5 shadow-xl">
      {tools.map(({ icon: Icon, label, keys }) => (
        <Tooltip key={label} content={tip(label, keys)} {...p}>
          <button aria-label={label} className={btn}>
            <Icon className="size-4" />
          </button>
        </Tooltip>
      ))}
      <span aria-hidden className="mx-1 h-5 w-px bg-border" />
      {/* Open on load so the preview shows one; hover or focus the others. */}
      <Tooltip key={JSON.stringify(p)} content={tip("Insert link", "Ctrl K")} {...p} defaultOpen>
        <button aria-label="Insert link" className={btn}>
          <Link2 className="size-4" />
        </button>
      </Tooltip>
    </div>
  );
}
