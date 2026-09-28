"use client";

import { Badge } from "./badge";

const services = [
  { name: "API", status: "Operational", variant: "success" as const, pulse: true },
  { name: "Dashboard", status: "Degraded", variant: "warning" as const, pulse: true },
  { name: "Webhooks", status: "Outage", variant: "destructive" as const, pulse: true },
  { name: "Docs", status: "Maintenance", variant: "secondary" as const, pulse: false },
];

export default function Demo(p: Record<string, unknown>) {
  return (
    <div className="w-full max-w-sm rounded-2xl border border-border bg-card p-5 shadow-xl">
      <div className="mb-4 flex items-center justify-between">
        <p className="font-semibold text-foreground">System status</p>
        <Badge {...p} />
      </div>
      <ul className="grid gap-3">
        {services.map((s) => (
          <li key={s.name} className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">{s.name}</span>
            <Badge variant={s.variant} dot pulse={s.pulse}>
              {s.status}
            </Badge>
          </li>
        ))}
      </ul>
      <div className="mt-4 flex flex-wrap gap-2 border-t border-border pt-4">
        <Badge shine>Pro</Badge>
        <Badge variant="outline">v2.4.0</Badge>
        <Badge variant="secondary" size="sm">
          Beta
        </Badge>
      </div>
    </div>
  );
}
