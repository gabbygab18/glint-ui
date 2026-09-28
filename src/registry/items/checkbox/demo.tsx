"use client";

import { useState } from "react";
import { Checkbox } from "./checkbox";

const channels = [
  { id: "mentions", label: "Mentions", description: "When someone @mentions you" },
  { id: "replies", label: "Replies", description: "Replies to your threads" },
  { id: "digest", label: "Weekly digest", description: "A summary every Monday" },
];

export default function Demo(p: Record<string, unknown>) {
  const [on, setOn] = useState<string[]>(["mentions"]);
  const all = on.length === channels.length;
  const toggle = (id: string) => setOn((v) => (v.includes(id) ? v.filter((x) => x !== id) : [...v, id]));

  return (
    <div className="w-full max-w-sm rounded-2xl border border-border bg-card p-5 shadow-xl">
      <fieldset className="grid gap-4">
        <legend className="mb-4 font-semibold text-foreground">Notifications</legend>
        <Checkbox
          label="All notifications"
          checked={all}
          indeterminate={on.length > 0 && !all}
          onChange={() => setOn(all ? [] : channels.map((c) => c.id))}
        />
        <div className="ml-2.5 grid gap-4 border-l border-border pl-5">
          {channels.map((c) => (
            <Checkbox
              key={c.id}
              label={c.label}
              description={c.description}
              checked={on.includes(c.id)}
              onChange={() => toggle(c.id)}
            />
          ))}
        </div>
      </fieldset>
      <div className="mt-5 border-t border-border pt-5">
        <Checkbox {...p} />
      </div>
    </div>
  );
}
