"use client";

import { useRef } from "react";
import { Flag, GitMerge, Globe, Rocket, Sparkles, Users } from "lucide-react";
import { Timeline, type TimelineItem } from "./timeline";

const Tag = ({ children }: { children: string }) => (
  <span className="mr-1.5 mt-3 inline-block rounded-md border border-border bg-muted px-2 py-0.5 text-[11px] font-medium text-foreground">
    {children}
  </span>
);

const items: TimelineItem[] = [
  {
    date: "Jan 2025",
    title: "First commit",
    icon: <Flag />,
    description: "Two founders, one repo, and a question: why is shipping a polished UI still this slow?",
  },
  {
    date: "Apr 2025",
    title: "Private beta",
    icon: <Users />,
    description: (
      <>
        40 design teams join the beta. Feedback loops shrink from weeks to hours.
        <br />
        <Tag>Waitlist</Tag>
        <Tag>Discord</Tag>
      </>
    ),
  },
  {
    date: "Jul 2025",
    title: "v1.0 launch",
    icon: <Rocket />,
    description: "Number one on Product Hunt, 12k signups in the first week and a very tired support inbox.",
  },
  {
    date: "Oct 2025",
    title: "Open source core",
    icon: <GitMerge />,
    description: (
      <>
        The component engine goes MIT. 300 contributors in the first month.
        <br />
        <Tag>GitHub</Tag>
        <Tag>MIT</Tag>
      </>
    ),
  },
  {
    date: "Feb 2026",
    title: "Global edge network",
    icon: <Globe />,
    description: "Previews render in 18 regions. Median build time drops below eight seconds.",
  },
  {
    date: "Today",
    title: "What comes next",
    icon: <Sparkles />,
    description: "AI-assisted theming, a Figma bridge and a lot more motion. Stay tuned.",
  },
];

export default function Demo(p: Record<string, unknown>) {
  const box = useRef<HTMLDivElement>(null);
  return (
    <div
      ref={box}
      className="relative h-[26rem] w-full max-w-xl overflow-y-auto overscroll-contain rounded-2xl border border-border bg-card/40 px-8 [scrollbar-width:thin]"
    >
      <div className="flex h-28 flex-col items-center justify-end gap-2 pb-8 text-xs uppercase tracking-[0.3em] text-muted-foreground">
        Our story
        <span className="animate-bounce">↓</span>
      </div>
      <Timeline items={items} {...p} scrollContainerRef={box} />
      <div className="h-56" />
    </div>
  );
}
