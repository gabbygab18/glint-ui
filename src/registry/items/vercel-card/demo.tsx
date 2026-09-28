"use client";

import { ArrowUpRight, Globe, ShieldCheck, Zap } from "lucide-react";
import { VercelCard } from "./vercel-card";

const features = [
  {
    icon: Zap,
    title: "Instant rollbacks",
    body: "Every deploy is immutable. Revert production to any previous build in a single click.",
    meta: "~300ms",
  },
  {
    icon: Globe,
    title: "Edge by default",
    body: "Static assets and functions run close to your users in regions across the globe.",
    meta: "18 regions",
  },
  {
    icon: ShieldCheck,
    title: "Secure previews",
    body: "Password-protect preview URLs and share them with reviewers without leaking drafts.",
    meta: "SSO ready",
  },
];

export default function Demo(p: Record<string, unknown>) {
  return (
    <div className="grid w-full max-w-5xl gap-6 px-2 md:grid-cols-3">
      {features.map(({ icon: Icon, title, body, meta }) => (
        <VercelCard key={title} {...p}>
          <div className="flex h-full min-h-64 flex-col p-7">
            <span className="grid size-10 place-items-center rounded-lg border border-border bg-background text-foreground">
              <Icon className="size-4" aria-hidden />
            </span>
            <h3 className="mt-8 text-lg font-semibold tracking-tight text-foreground">{title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{body}</p>
            <div className="mt-auto flex items-center justify-between pt-8 font-mono text-xs text-muted-foreground">
              <span>{meta}</span>
              <a
                href="#"
                onClick={(e) => e.preventDefault()}
                className="inline-flex items-center gap-1 rounded text-foreground underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                Learn more <ArrowUpRight className="size-3.5" aria-hidden />
              </a>
            </div>
          </div>
        </VercelCard>
      ))}
    </div>
  );
}
