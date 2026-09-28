"use client";

import { Building2, Rocket, User } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "./radio-group";

const plans = [
  { value: "hobby", label: "Hobby", description: "Personal projects, 1 seat", icon: <User /> },
  { value: "pro", label: "Pro", description: "$20 / month, unlimited builds", icon: <Rocket /> },
  { value: "team", label: "Team", description: "SSO, audit log, 10+ seats", icon: <Building2 /> },
];

export default function Demo(p: Record<string, unknown>) {
  return (
    <div className="grid w-full max-w-3xl gap-4 px-4 sm:grid-cols-2">
      <div className="rounded-2xl border border-border bg-card p-5 shadow-xl">
        <p id="rg-plan" className="mb-4 font-semibold text-foreground">
          Choose a plan
        </p>
        <RadioGroup variant="card" aria-labelledby="rg-plan" defaultValue="pro">
          {plans.map((plan) => (
            <RadioGroupItem key={plan.value} {...plan} />
          ))}
        </RadioGroup>
      </div>
      <div className="rounded-2xl border border-border bg-card p-5 shadow-xl">
        <p id="rg-notify" className="mb-4 font-semibold text-foreground">
          Notify me about
        </p>
        <RadioGroup aria-labelledby="rg-notify" defaultValue="mentions" {...p}>
          <RadioGroupItem value="all" label="All new messages" description="Every message in every channel." />
          <RadioGroupItem value="mentions" label="Mentions" description="Only when someone needs you." />
          <RadioGroupItem value="none" label="Nothing" />
        </RadioGroup>
      </div>
    </div>
  );
}
