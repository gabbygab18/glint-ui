"use client";

import { useState } from "react";
import { Status, type StatusKind } from "./status";

const team: { name: string; role: string; status: StatusKind; hue: number }[] = [
  { name: "Maya Chen", role: "Design lead", status: "online", hue: 150 },
  { name: "Leo Park", role: "Frontend", status: "busy", hue: 20 },
  { name: "Ines Duarte", role: "Product", status: "away", hue: 70 },
  { name: "Sam Okafor", role: "Backend", status: "offline", hue: 250 },
];

const cycle: StatusKind[] = ["online", "away", "busy", "offline"];

export default function Demo(p: Record<string, unknown>) {
  const [mine, setMine] = useState(0);
  return (
    <div className="w-full max-w-sm rounded-2xl border border-border bg-card p-5 shadow-xl">
      <div className="mb-4 flex items-center justify-between">
        <p className="font-semibold text-foreground">Team</p>
        <Status {...p} />
      </div>
      <ul className="grid gap-3">
        {team.map((m) => (
          <li key={m.name} className="flex items-center gap-3">
            <span className="relative">
              <span
                className="grid size-9 place-items-center rounded-full text-xs font-semibold text-white"
                style={{ background: `oklch(0.62 0.13 ${m.hue})` }}
              >
                {m.name
                  .split(" ")
                  .map((w) => w[0])
                  .join("")}
              </span>
              <span className="absolute -right-0.5 -bottom-0.5 grid size-3.5 place-items-center rounded-full bg-card">
                <Status status={m.status} hideLabel size="sm" />
              </span>
            </span>
            <span className="grid flex-1 text-sm leading-tight">
              <span className="font-medium text-foreground">{m.name}</span>
              <span className="text-muted-foreground">{m.role}</span>
            </span>
            <Status status={m.status} variant="plain" size="sm" className="text-muted-foreground" />
          </li>
        ))}
      </ul>
      <button
        onClick={() => setMine((i) => (i + 1) % cycle.length)}
        className="mt-5 flex w-full items-center justify-between rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none transition-colors hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring/60"
      >
        Set my status
        <Status status={cycle[mine]} size="sm" />
      </button>
    </div>
  );
}
