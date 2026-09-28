"use client";

import { useState } from "react";
import { SwipeRow } from "./swipe-row";

const inbox = [
  { id: 1, from: "Maya Chen", subject: "Q3 roadmap draft", time: "9:41", tint: "bg-lime-300" },
  { id: 2, from: "Stripe", subject: "Payout of $1,204.50 sent", time: "8:12", tint: "bg-indigo-400" },
  { id: 3, from: "Leo Park", subject: "Lunch on Thursday?", time: "Yday", tint: "bg-amber-300" },
  { id: 4, from: "GitHub", subject: "PR #128 was merged", time: "Mon", tint: "bg-violet-400" },
];

export default function Demo(p: Record<string, unknown>) {
  const [items, setItems] = useState(inbox);
  const [log, setLog] = useState("Swipe a row, or focus it and press ← →");
  const drop = (id: number, verb: string) => {
    setItems((v) => v.filter((m) => m.id !== id));
    setLog(`${verb}: ${inbox.find((m) => m.id === id)?.subject}`);
  };

  return (
    <div className="w-full max-w-md px-4">
      <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-xl">
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <span className="font-semibold text-foreground">Inbox</span>
          <button
            type="button"
            onClick={() => setItems(inbox)}
            className="rounded-md px-2 py-1 text-xs text-muted-foreground hover:text-foreground focus-visible:outline-2 focus-visible:outline-ring"
          >
            Reset
          </button>
        </div>
        <div className="divide-y divide-border">
          {items.map((m) => (
            <SwipeRow
              key={m.id}
              {...p}
              label={`${m.from}: ${m.subject}`}
              onArchive={() => drop(m.id, "Archived")}
              onDelete={() => drop(m.id, "Deleted")}
            >
              <div className="flex items-center gap-3 px-4 py-3">
                <span className={`size-9 shrink-0 rounded-full ${m.tint}`} />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-foreground">{m.from}</p>
                  <p className="truncate text-xs text-muted-foreground">{m.subject}</p>
                </div>
                <span className="text-xs text-muted-foreground">{m.time}</span>
              </div>
            </SwipeRow>
          ))}
          {items.length === 0 && <p className="px-4 py-8 text-center text-sm text-muted-foreground">Inbox zero.</p>}
        </div>
      </div>
      <p className="mt-3 text-center text-xs text-muted-foreground" aria-live="polite">
        {log}
      </p>
    </div>
  );
}
