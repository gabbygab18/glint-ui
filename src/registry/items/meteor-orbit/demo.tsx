"use client";

import { Boxes, Bot, Cloud, Code2, Cpu, Database, GitBranch, Globe, Lock, Server, Webhook, Zap } from "lucide-react";
import { MeteorOrbit } from "./meteor-orbit";

const items = [
  { label: "Database", icon: <Database /> },
  { label: "Cloud", icon: <Cloud /> },
  { label: "Compute", icon: <Cpu /> },
  { label: "Code", icon: <Code2 /> },
  { label: "Git", icon: <GitBranch /> },
  { label: "Auth", icon: <Lock /> },
  { label: "Edge", icon: <Zap /> },
  { label: "CDN", icon: <Globe /> },
  { label: "Servers", icon: <Server /> },
  { label: "Webhooks", icon: <Webhook /> },
  { label: "Packages", icon: <Boxes /> },
  { label: "AI", icon: <Bot /> },
];

export default function Demo(p: Record<string, unknown>) {
  return (
    <MeteorOrbit items={items} {...p}>
      <div className="grid size-16 place-items-center rounded-2xl bg-gradient-to-br from-lime-300 to-emerald-500 shadow-[0_0_40px_-4px_rgba(163,230,53,.6)]">
        <svg viewBox="0 0 24 24" className="size-8 fill-black/80" aria-label="Glint">
          <path d="M12 2l2.4 7.6L22 12l-7.6 2.4L12 22l-2.4-7.6L2 12l7.6-2.4z" />
        </svg>
      </div>
    </MeteorOrbit>
  );
}
