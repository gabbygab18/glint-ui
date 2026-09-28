"use client";
/* eslint-disable @next/next/no-img-element */

import { useState } from "react";
import { demoImages } from "../../demo-kit";
import { Step, Stepper } from "./stepper";

const [avatar] = demoImages(1, 160, 160);
const plans = [
  { id: "starter", name: "Starter", price: "$0", note: "For side projects" },
  { id: "pro", name: "Pro", price: "$19", note: "For growing teams" },
  { id: "scale", name: "Scale", price: "$49", note: "SSO and audit logs" },
];

export default function Demo(p: Record<string, unknown>) {
  const [plan, setPlan] = useState("pro");
  const [name, setName] = useState("Acme Studio");
  return (
    <Stepper {...p}>
      <Step title="Welcome">
        <div className="flex items-center gap-4">
          <img src={avatar} alt="" className="size-14 rounded-2xl object-cover" />
          <div>
            <h3 className="text-xl font-semibold tracking-tight">Welcome aboard</h3>
            <p className="mt-1 text-sm text-muted-foreground">Three quick steps and your workspace is ready.</p>
          </div>
        </div>
      </Step>
      <Step title="Plan">
        <h3 className="text-xl font-semibold tracking-tight">Pick a plan</h3>
        <div role="radiogroup" aria-label="Plan" className="mt-4 grid gap-2">
          {plans.map((pl) => (
            <button
              key={pl.id}
              type="button"
              role="radio"
              aria-checked={plan === pl.id}
              onClick={() => setPlan(pl.id)}
              className={`flex items-center justify-between rounded-xl border px-4 py-3 text-left outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring ${plan === pl.id ? "border-foreground/40 bg-muted" : "border-border hover:bg-muted/50"}`}
            >
              <span>
                <span className="block text-sm font-medium">{pl.name}</span>
                <span className="block text-xs text-muted-foreground">{pl.note}</span>
              </span>
              <span className="text-sm font-semibold tabular-nums">{pl.price}/mo</span>
            </button>
          ))}
        </div>
      </Step>
      <Step title="Workspace">
        <h3 className="text-xl font-semibold tracking-tight">Name your workspace</h3>
        <label className="mt-4 block text-xs font-medium text-muted-foreground" htmlFor="stepper-ws">
          Workspace name
        </label>
        <input
          id="stepper-ws"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="mt-1.5 w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
        <p className="mt-2 text-xs text-muted-foreground">app.acme.dev/{name.toLowerCase().replace(/[^a-z0-9]+/g, "-") || "…"}</p>
      </Step>
      <Step title="Review">
        <h3 className="text-xl font-semibold tracking-tight">Ready to launch</h3>
        <dl className="mt-4 divide-y divide-border rounded-xl border border-border text-sm">
          <div className="flex justify-between px-4 py-2.5">
            <dt className="text-muted-foreground">Plan</dt>
            <dd className="font-medium">{plans.find((x) => x.id === plan)?.name}</dd>
          </div>
          <div className="flex justify-between px-4 py-2.5">
            <dt className="text-muted-foreground">Workspace</dt>
            <dd className="font-medium">{name || "Untitled"}</dd>
          </div>
        </dl>
      </Step>
    </Stepper>
  );
}
