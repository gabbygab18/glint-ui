"use client";

import { BarChart3, CalendarDays, FolderKanban, Inbox, LayoutGrid, Settings, Users } from "lucide-react";
import { LineSidebar } from "./line-sidebar";

const items = [
  { label: "Dashboard", icon: <LayoutGrid /> },
  { label: "Projects", icon: <FolderKanban />, badge: "8" },
  { label: "Inbox", icon: <Inbox />, badge: "12" },
  { label: "Calendar", icon: <CalendarDays /> },
  { label: "Analytics", icon: <BarChart3 /> },
  { label: "Team", icon: <Users /> },
  { label: "Settings", icon: <Settings /> },
];

export default function Demo(p: Record<string, unknown>) {
  return (
    <aside className="w-64 rounded-2xl border border-border bg-card/80 p-4 shadow-2xl backdrop-blur">
      <div className="mb-4 flex items-center gap-3 px-2">
        <span className="size-8 rounded-lg bg-gradient-to-br from-lime-300 to-emerald-500" />
        <div>
          <p className="text-sm font-semibold text-foreground">Acme Studio</p>
          <p className="text-xs text-muted-foreground">Pro workspace</p>
        </div>
      </div>
      <LineSidebar key={String(p.defaultActive)} items={items} {...p} />
    </aside>
  );
}
