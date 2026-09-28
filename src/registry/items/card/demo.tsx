"use client";

import { Check } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./card";

const features = ["Unlimited projects", "Preview deployments", "Role-based access", "Priority support"];

export default function Demo(p: Record<string, unknown>) {
  return (
    <Card {...p} className="w-full max-w-sm">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Team</CardTitle>
          <span className="rounded-full bg-primary/15 px-2 py-0.5 text-xs font-medium text-primary">Popular</span>
        </div>
        <CardDescription>Everything a growing product team needs to ship.</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="mb-5 flex items-baseline gap-1">
          <span className="text-4xl font-semibold tracking-tight text-foreground">$24</span>
          <span className="text-sm text-muted-foreground">/ seat / month</span>
        </p>
        <ul className="grid gap-2.5 text-sm">
          {features.map((f) => (
            <li key={f} className="flex items-center gap-2.5 text-foreground">
              <Check className="size-4 text-primary" aria-hidden />
              {f}
            </li>
          ))}
        </ul>
      </CardContent>
      <CardFooter>
        <button className="h-10 flex-1 rounded-lg bg-primary text-sm font-medium text-primary-foreground outline-none transition-colors hover:bg-primary/90 focus-visible:ring-2 focus-visible:ring-ring/60">
          Start free trial
        </button>
      </CardFooter>
    </Card>
  );
}
