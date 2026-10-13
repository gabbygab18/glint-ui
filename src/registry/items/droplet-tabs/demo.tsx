"use client";

import { useState } from "react";
import { DropletTabs } from "./droplet-tabs";

export default function Demo(p: Record<string, unknown>) {
  const [plan, setPlan] = useState("Monthly");
  return (
    <div className="grid justify-items-center gap-8">
      <DropletTabs key={String(p.options)} {...p} />
      <div className="grid justify-items-center gap-2">
        <DropletTabs label="Billing" options={["Monthly", "Yearly"]} value={plan} onValueChange={setPlan} color="#8b5cf6" />
        <p className="text-xs text-muted-foreground" aria-live="polite">
          {plan === "Yearly" ? "2 months free" : "Cancel anytime"}
        </p>
      </div>
    </div>
  );
}
