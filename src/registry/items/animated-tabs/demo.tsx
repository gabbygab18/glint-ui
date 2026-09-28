"use client";

import type { ReactNode } from "react";
import { Bell, ChartColumn, LayoutGrid, Settings } from "lucide-react";
import { demoImages } from "../../demo-kit";
import { AnimatedTabs } from "./animated-tabs";

const avatars = demoImages(4, 80, 80);

const Panel = ({ children }: { children: ReactNode }) => (
  <div className="mx-auto w-[min(34rem,100%)] rounded-2xl border border-border bg-card p-5 shadow-[0_24px_60px_-30px_rgba(0,0,0,.7)]">{children}</div>
);

const tabs = [
  {
    id: "overview",
    label: "Overview",
    icon: <LayoutGrid />,
    content: (
      <Panel>
        <p className="text-sm text-muted-foreground">This month</p>
        <div className="mt-3 grid grid-cols-3 gap-3">
          {[
            ["Revenue", "$48.2k", "+12.4%"],
            ["Customers", "2,391", "+4.1%"],
            ["Churn", "1.8%", "-0.3%"],
          ].map(([k, v, d]) => (
            <div key={k} className="rounded-xl bg-muted/60 p-3">
              <p className="text-xs text-muted-foreground">{k}</p>
              <p className="mt-1 text-xl font-semibold text-foreground">{v}</p>
              <p className="text-xs text-emerald-400">{d}</p>
            </div>
          ))}
        </div>
      </Panel>
    ),
  },
  {
    id: "analytics",
    label: "Analytics",
    icon: <ChartColumn />,
    content: (
      <Panel>
        <div className="flex items-baseline justify-between">
          <p className="font-medium text-foreground">Weekly visitors</p>
          <p className="text-xs text-muted-foreground">Last 12 weeks</p>
        </div>
        <div className="mt-4 flex h-28 items-end gap-2">
          {[38, 52, 45, 60, 58, 72, 66, 80, 74, 88, 92, 100].map((h, i) => (
            <div key={i} className="flex-1 rounded-t-md bg-gradient-to-t from-cyan-500/40 to-lime-300" style={{ height: `${h}%` }} />
          ))}
        </div>
      </Panel>
    ),
  },
  {
    id: "activity",
    label: "Activity",
    icon: <Bell />,
    content: (
      <Panel>
        <ul className="flex flex-col gap-3">
          {[
            ["Maya Chen", "merged PR #214 into main", "2m"],
            ["Leo Park", "commented on Pricing v2", "18m"],
            ["Ana Ruiz", "invited 3 teammates", "1h"],
          ].map(([who, what, when], i) => (
            <li key={who} className="flex items-center gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={avatars[i]} alt="" className="size-9 rounded-full object-cover" />
              <p className="flex-1 text-sm text-muted-foreground">
                <span className="font-medium text-foreground">{who}</span> {what}
              </p>
              <span className="text-xs text-muted-foreground">{when}</span>
            </li>
          ))}
        </ul>
      </Panel>
    ),
  },
  {
    id: "settings",
    label: "Settings",
    icon: <Settings />,
    content: (
      <Panel>
        {[
          ["Email digests", "Weekly summary every Monday", true],
          ["Push alerts", "Only for mentions", false],
          ["Public profile", "Visible to your workspace", true],
        ].map(([k, d, on]) => (
          <div key={String(k)} className="flex items-center justify-between border-b border-border py-3 last:border-0">
            <div>
              <p className="text-sm font-medium text-foreground">{k}</p>
              <p className="text-xs text-muted-foreground">{d}</p>
            </div>
            <span className={`flex h-6 w-10 items-center rounded-full p-0.5 ${on ? "justify-end bg-primary" : "bg-muted"}`}>
              <span className="size-5 rounded-full bg-background" />
            </span>
          </div>
        ))}
      </Panel>
    ),
  },
];

export default function Demo(p: Record<string, unknown>) {
  return (
    <div className="w-full max-w-2xl">
      <AnimatedTabs tabs={tabs} {...p} />
    </div>
  );
}
