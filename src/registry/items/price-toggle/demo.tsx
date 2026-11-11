"use client";

import { Check } from "lucide-react";
import { PriceToggle } from "./price-toggle";

export default function Demo(p: Record<string, unknown>) {
  return (
    <div className="w-80 rounded-2xl border border-border bg-card p-6 text-center shadow-xl">
      <p className="mb-5 text-sm font-semibold text-foreground">Pro plan</p>
      <PriceToggle monthly={24} yearly={19} {...p} />
      <ul className="mt-6 grid gap-2 text-left text-sm text-foreground">
        {["Unlimited projects", "Team workspaces", "Priority support"].map((f) => (
          <li key={f} className="flex items-center gap-2">
            <Check className="size-4 text-primary" /> {f}
          </li>
        ))}
      </ul>
    </div>
  );
}
