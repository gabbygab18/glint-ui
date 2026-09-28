"use client";

import { useState } from "react";
import { Check, Copy, Share2, X } from "lucide-react";
import { Popover, PopoverClose, PopoverContent, PopoverTrigger } from "./popover";

const people = [
  { name: "Ana Reyes", role: "Owner", tint: "from-lime-300 to-emerald-500" },
  { name: "Marco Silva", role: "Can edit", tint: "from-cyan-300 to-blue-600" },
];

export default function Demo(p: Record<string, unknown>) {
  const [copied, setCopied] = useState(false);
  return (
    // Opens by default so the preview shows it; it is anchored to the trigger in the top layer.
    <div className="flex h-96 w-full items-start justify-center pt-10">
      <Popover defaultOpen>
        <PopoverTrigger>
          <Share2 /> Share
        </PopoverTrigger>
        <PopoverContent {...p} aria-labelledby="pop-title" className="w-80">
          <div className="mb-3 flex items-start justify-between gap-4">
            <div>
              <h3 id="pop-title" className="font-semibold text-foreground">
                Share &ldquo;Q3 roadmap&rdquo;
              </h3>
              <p className="text-xs text-muted-foreground">Anyone with the link can view.</p>
            </div>
            <PopoverClose aria-label="Close" className="-m-1 grid size-7 place-items-center rounded-md text-muted-foreground outline-none hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/60">
              <X className="size-4" />
            </PopoverClose>
          </div>
          <div className="flex gap-2">
            <input
              readOnly
              aria-label="Share link"
              value="acme.app/d/q3-roadmap"
              className="h-9 min-w-0 flex-1 rounded-lg border border-input bg-background px-3 text-xs text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring/60"
            />
            <button
              type="button"
              onClick={() => {
                setCopied(true);
                setTimeout(() => setCopied(false), 1400);
              }}
              className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-primary px-3 text-xs font-medium text-primary-foreground outline-none transition-[scale] hover:bg-primary/90 focus-visible:ring-2 focus-visible:ring-ring/60 active:scale-95"
            >
              {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
              {copied ? "Copied" : "Copy"}
            </button>
          </div>
          <ul className="mt-4 grid gap-2.5 border-t border-border pt-3">
            {people.map((person) => (
              <li key={person.name} className="flex items-center gap-2.5">
                <span className={`size-7 rounded-full bg-linear-to-br ${person.tint}`} />
                <span className="flex-1 text-sm text-foreground">{person.name}</span>
                <span className="text-xs text-muted-foreground">{person.role}</span>
              </li>
            ))}
          </ul>
        </PopoverContent>
      </Popover>
    </div>
  );
}
