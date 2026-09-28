"use client";

import { ArrowUpRight, BarChart3, BookOpen, Code2, Palette, Rocket, Shield, Workflow, Building2, Megaphone, Plug } from "lucide-react";
import { demoImages } from "../../demo-kit";
import { MotionNavbar } from "./motion-navbar";

const [cover] = demoImages(1, 480, 300);
const link = "rounded-xl p-3 outline-none transition-colors hover:bg-muted focus-visible:bg-muted";

const products = (
  <div className="grid w-[30rem] grid-cols-2 gap-1 p-2">
    {[
      [BarChart3, "Analytics", "Realtime dashboards for every metric", "text-sky-400"],
      [Workflow, "Automations", "Trigger flows without writing code", "text-violet-400"],
      [Plug, "Integrations", "Connect 120+ tools in a click", "text-emerald-400"],
      [Shield, "Security", "SSO, audit logs and SOC 2", "text-amber-400"],
    ].map(([Icon, t, d, c]) => {
      const I = Icon as typeof BarChart3;
      return (
        <a key={t as string} href="#" className={`flex gap-3 ${link}`}>
          <span className={`grid size-9 shrink-0 place-items-center rounded-lg border border-border bg-background/60 ${c as string}`}>
            <I className="size-4" />
          </span>
          <span>
            <span className="block text-sm font-medium text-foreground">{t as string}</span>
            <span className="block text-xs text-muted-foreground">{d as string}</span>
          </span>
        </a>
      );
    })}
  </div>
);

const solutions = (
  <div className="flex w-[22rem] gap-2 p-2">
    {[
      ["By team", [[Code2, "Engineering"], [Palette, "Design"], [Megaphone, "Marketing"]]],
      ["By stage", [[Rocket, "Startups"], [Building2, "Enterprise"]]],
    ].map(([title, rows]) => (
      <div key={title as string} className="flex-1">
        <p className="px-3 pb-1 pt-2 text-[11px] uppercase tracking-widest text-muted-foreground">{title as string}</p>
        {(rows as [typeof Code2, string][]).map(([I, t]) => (
          <a key={t} href="#" className={`flex items-center gap-2.5 text-sm text-foreground ${link} py-2`}>
            <I className="size-4 text-muted-foreground" /> {t}
          </a>
        ))}
      </div>
    ))}
  </div>
);

const resources = (
  <div className="flex w-[32rem] gap-2 p-2">
    <a href="#" className="group relative w-56 shrink-0 overflow-hidden rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-ring">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={cover} alt="" className="absolute inset-0 size-full object-cover transition-transform duration-500 group-hover:scale-105" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/85 to-transparent" />
      <div className="absolute inset-x-3 bottom-3 text-white">
        <p className="text-[11px] uppercase tracking-widest text-white/60">Case study</p>
        <p className="text-sm font-medium">How Lumen cut churn by 32%</p>
      </div>
    </a>
    <div className="flex-1">
      {[
        [BookOpen, "Documentation", "Guides and API reference"],
        [Code2, "Changelog", "What shipped this week"],
        [ArrowUpRight, "Community", "12k builders on Discord"],
      ].map(([Icon, t, d]) => {
        const I = Icon as typeof BookOpen;
        return (
          <a key={t as string} href="#" className={`flex gap-3 ${link}`}>
            <I className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
            <span>
              <span className="block text-sm font-medium text-foreground">{t as string}</span>
              <span className="block text-xs text-muted-foreground">{d as string}</span>
            </span>
          </a>
        );
      })}
    </div>
  </div>
);

const items = [
  { label: "Products", content: products },
  { label: "Solutions", content: solutions },
  { label: "Resources", content: resources },
  { label: "Pricing", href: "#" },
];

const logo = (
  <span className="flex items-center gap-2 text-sm font-semibold text-foreground">
    <span className="size-5 rounded-md bg-gradient-to-br from-sky-300 to-violet-500" /> Nimbus
  </span>
);

const actions = (
  <>
    <a href="#" className="hidden rounded-lg px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground sm:block">
      Sign in
    </a>
    <a href="#" className="rounded-lg bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground">
      Get started
    </a>
  </>
);

export default function Demo(p: Record<string, unknown>) {
  return (
    <div className="absolute inset-x-0 top-6 flex justify-center px-4">
      <MotionNavbar items={items} logo={logo} actions={actions} className="max-w-3xl" {...p} />
    </div>
  );
}
