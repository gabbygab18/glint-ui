"use client";

import { ChartColumn, Code, Cpu, Globe, Layers, Mail, MessageCircle, Palette, Search, Shield, Zap } from "lucide-react";
import { BentoCard, BentoGrid } from "./bento-grid";

const SearchVisual = () => (
  <div className="absolute inset-x-6 top-5 rounded-xl border border-border bg-background/60 p-2 transition-transform duration-500 group-hover/bento:-translate-y-1">
    <div className="flex items-center gap-2 border-b border-border px-2 pb-2 text-sm text-muted-foreground">
      <Search className="size-4" /> Search docs, people, files…
      <kbd className="ml-auto rounded border border-border px-1.5 text-[10px]">⌘K</kbd>
    </div>
    {["Quarterly roadmap.pdf", "Design tokens v3", "Maya Chen"].map((r, i) => (
      <div
        key={r}
        className={`mt-1 rounded-md px-2 py-1.5 text-xs text-muted-foreground transition-colors duration-300 ${
          i === 0 ? "bg-muted text-foreground group-hover/bento:bg-transparent group-hover/bento:text-muted-foreground" : ""
        } ${i === 1 ? "group-hover/bento:bg-muted group-hover/bento:text-foreground" : ""}`}
      >
        {r}
      </div>
    ))}
  </div>
);

const ChartVisual = () => (
  <div className="absolute inset-x-6 top-6 flex h-24 items-end gap-1.5">
    {[40, 65, 50, 80, 60, 95, 75].map((h, i) => (
      <div
        key={i}
        className="flex-1 origin-bottom scale-y-[.55] rounded-t bg-gradient-to-t from-lime-500/20 to-lime-300 transition-transform duration-700 ease-[cubic-bezier(.2,.8,.2,1.2)] group-hover/bento:scale-y-100"
        style={{ height: `${h}%`, transitionDelay: `${i * 45}ms` }}
      />
    ))}
  </div>
);

const ShieldVisual = () => (
  <div className="absolute inset-x-0 top-4 grid place-items-center">
    {[112, 84, 56].map((s, i) => (
      <span
        key={s}
        className="absolute rounded-full border border-cyan-400/30 transition-transform duration-700 group-hover/bento:scale-125"
        style={{ width: s, height: s, top: 0, marginTop: (112 - s) / 2, transitionDelay: `${i * 70}ms` }}
      />
    ))}
    <span className="relative mt-[34px] grid size-11 place-items-center rounded-full bg-cyan-400/15 text-cyan-300">
      <Shield className="size-5" />
    </span>
  </div>
);

const chips = [Mail, MessageCircle, Palette, Code, Globe, Cpu, Layers, Zap];
const IntegrationsVisual = () => (
  <div className="absolute inset-x-0 top-5 flex flex-col gap-2 overflow-hidden">
    <style href="bento-demo" precedence="default">{`@keyframes bento-demo-marquee{to{transform:translateX(-50%)}}`}</style>
    {[0, 1].map((row) => (
      <div
        key={row}
        className="flex w-max gap-2 [animation:bento-demo-marquee_24s_linear_infinite] group-hover/bento:[animation-duration:10s]"
        style={{ animationDirection: row ? "reverse" : "normal" }}
      >
        {[...chips, ...chips].map((Icon, i) => (
          <span key={i} className="grid size-12 place-items-center rounded-xl border border-border bg-muted/70 text-muted-foreground">
            <Icon className="size-5" />
          </span>
        ))}
      </div>
    ))}
  </div>
);

export default function Demo(p: Record<string, unknown>) {
  return (
    <div className="w-full max-w-4xl px-4">
      <BentoGrid {...p}>
        <BentoCard
          className="md:col-span-2"
          icon={<Search />}
          title="Instant search"
          description="Find any doc, person or file in milliseconds."
          visual={<SearchVisual />}
          href="#"
        />
        <BentoCard icon={<ChartColumn />} title="Live analytics" description="Watch metrics update in real time." visual={<ChartVisual />} href="#" />
        <BentoCard icon={<Shield />} title="Secure by default" description="SSO, audit logs and encryption at rest." visual={<ShieldVisual />} href="#" />
        <BentoCard
          className="md:col-span-2"
          icon={<Layers />}
          title="120+ integrations"
          description="Connect the tools your team already uses, no code required."
          visual={<IntegrationsVisual />}
          href="#"
          cta="Browse integrations"
        />
      </BentoGrid>
    </div>
  );
}
