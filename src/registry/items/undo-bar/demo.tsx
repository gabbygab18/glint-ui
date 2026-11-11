"use client";

import { Trash2 } from "lucide-react";
import { useState } from "react";
import { UndoBar } from "./undo-bar";

const INBOX = ["Design review notes", "Invoice #2041", "Team offsite plan", "Weekly metrics"];

export default function Demo(p: Record<string, unknown>) {
  const [items, setItems] = useState(INBOX);
  const [removed, setRemoved] = useState<{ item: string; index: number } | null>(null);

  const remove = (index: number) => {
    setRemoved({ item: items[index], index });
    setItems((list) => list.filter((_, i) => i !== index));
  };
  const undo = () => {
    if (!removed) return;
    setItems((list) => [...list.slice(0, removed.index), removed.item, ...list.slice(removed.index)]);
    setRemoved(null);
  };

  return (
    <div className="relative h-80 w-96 max-w-full overflow-hidden rounded-2xl border border-border bg-card p-4 shadow-xl">
      <div className="mb-3 flex items-center justify-between">
        <p className="text-sm font-semibold text-foreground">Inbox</p>
        <button
          type="button"
          onClick={() => setItems(INBOX)}
          className="text-xs text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:underline"
        >
          Reset
        </button>
      </div>
      <ul className="space-y-1.5">
        {items.map((item, i) => (
          <li key={item} className="flex items-center justify-between rounded-lg bg-muted px-3 py-2.5 text-sm text-foreground">
            {item}
            <button
              type="button"
              aria-label={`Delete ${item}`}
              onClick={() => remove(i)}
              className="rounded-md p-1 text-muted-foreground transition-colors hover:text-destructive focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <Trash2 className="size-4" />
            </button>
          </li>
        ))}
      </ul>
      <UndoBar
        {...p}
        position="absolute"
        open={!!removed}
        message={removed ? `Deleted "${removed.item}"` : ""}
        onUndo={undo}
        onExpire={() => setRemoved(null)}
      />
    </div>
  );
}
