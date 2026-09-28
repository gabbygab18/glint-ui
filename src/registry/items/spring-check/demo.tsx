"use client";

import { useState } from "react";
import { SpringCheck } from "./spring-check";

const tasks = ["Write the changelog", "Bump the version", "Tag the release"];

export default function Demo(p: Record<string, unknown>) {
  const [done, setDone] = useState<string[]>([tasks[0]]);
  return (
    <div className="w-72 rounded-2xl border border-border bg-card p-5 shadow-xl">
      <p className="mb-4 text-sm font-semibold text-foreground">Release checklist</p>
      <div className="grid gap-3.5">
        {tasks.map((t) => (
          <SpringCheck
            key={t}
            label={<span className={done.includes(t) ? "text-muted-foreground line-through" : undefined}>{t}</span>}
            checked={done.includes(t)}
            onChange={(c) => setDone((d) => (c ? [...d, t] : d.filter((x) => x !== t)))}
            size={22}
          />
        ))}
        <div className="mt-1 border-t border-border pt-4">
          <SpringCheck key={String(p.defaultChecked)} {...p} />
        </div>
      </div>
    </div>
  );
}
