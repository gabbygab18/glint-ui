"use client";

import { Avatar } from "./avatar";

const face = (id: number) => `https://i.pravatar.cc/160?img=${id}`;

export default function Demo(p: Record<string, unknown>) {
  return (
    <div className="flex w-full max-w-sm flex-col gap-4 rounded-2xl border border-border bg-card p-5 shadow-xl">
      <div className="flex items-center gap-4">
        <Avatar src={face(47)} name="Maya Chen" status="online" {...p} size="xl" />
        <div>
          <p className="font-semibold text-foreground">Maya Chen</p>
          <p className="text-sm text-muted-foreground">Product designer · Lisbon</p>
        </div>
      </div>
      <div className="h-px bg-border" />
      <ul className="grid gap-3">
        {[
          { name: "Jonas Weber", src: face(12), status: "busy" as const, role: "Engineering" },
          { name: "Priya Raman", src: face(45), status: "away" as const, role: "Research" },
          { name: "Leo Martins", src: undefined, status: "offline" as const, role: "Support" },
        ].map((u) => (
          <li key={u.name} className="flex items-center gap-3">
            <Avatar src={u.src} name={u.name} status={u.status} size={(p.size as "md") ?? "md"} shape={p.shape as "circle"} />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-foreground">{u.name}</p>
              <p className="text-xs capitalize text-muted-foreground">
                {u.role} · {u.status}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
