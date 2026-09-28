"use client";

import { ChartNoAxesColumn, MessagesSquare, ShieldCheck, Workflow } from "lucide-react";
import type { ReactNode } from "react";
import { demoImages } from "../../demo-kit";
import { FeatureShowcase, type Feature } from "./feature-showcase";

const img = demoImages(8, 900, 680);

const Shot = ({ src, children }: { src: string; children: ReactNode }) => (
  <div className="relative size-full">
    {/* eslint-disable-next-line @next/next/no-img-element */}
    <img src={src} alt="" className="absolute inset-0 size-full object-cover" />
    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
    <div className="absolute inset-x-4 bottom-4 sm:inset-x-6 sm:bottom-6">{children}</div>
  </div>
);

const glass = "rounded-xl border border-white/15 bg-black/45 p-4 text-white shadow-2xl backdrop-blur-md";

const features: Feature[] = [
  {
    title: "Realtime analytics",
    icon: <ChartNoAxesColumn />,
    description: "Watch revenue, sign-ups and churn update the second they happen, no refresh needed.",
    visual: (
      <Shot src={img[2]}>
        <div className={glass}>
          <p className="text-xs text-white/60">Revenue this week</p>
          <p className="text-2xl font-semibold tracking-tight">$48,210 <span className="text-sm font-medium text-lime-300">+12.4%</span></p>
          <div className="mt-3 flex h-12 items-end gap-1.5">
            {[38, 52, 44, 61, 58, 74, 92].map((h, i) => (
              <span key={i} className="flex-1 rounded-sm bg-lime-300/80" style={{ height: `${h}%` }} />
            ))}
          </div>
        </div>
      </Shot>
    ),
  },
  {
    title: "Shared team inbox",
    icon: <MessagesSquare />,
    description: "Assign, snooze and reply to customer threads together without stepping on each other.",
    visual: (
      <Shot src={img[4]}>
        <div className={`${glass} grid gap-3`}>
          {[
            { who: "Maya Chen", msg: "Can we move the demo to Thursday?", av: 0 },
            { who: "Leo Park", msg: "Invoice #2291 is paid, thanks!", av: 1 },
          ].map((m) => (
            <div key={m.who} className="flex items-center gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={demoImages(2, 80, 80)[m.av]} alt="" className="size-8 rounded-full object-cover" />
              <div className="min-w-0">
                <p className="text-sm font-medium">{m.who}</p>
                <p className="truncate text-xs text-white/60">{m.msg}</p>
              </div>
            </div>
          ))}
        </div>
      </Shot>
    ),
  },
  {
    title: "No-code automations",
    icon: <Workflow />,
    description: "Chain triggers and actions visually. Route leads, tag tickets and ping Slack in a few clicks.",
    visual: (
      <Shot src={img[6]}>
        <div className={`${glass} flex flex-wrap items-center gap-2 text-sm`}>
          {["New signup", "Enrich profile", "Notify #sales"].map((s, i) => (
            <span key={s} className="flex items-center gap-2">
              {i > 0 && <span className="text-white/40">→</span>}
              <span className="rounded-lg bg-white/10 px-2.5 py-1.5">{s}</span>
            </span>
          ))}
        </div>
      </Shot>
    ),
  },
  {
    title: "Enterprise security",
    icon: <ShieldCheck />,
    description: "SSO, audit logs and granular roles out of the box. SOC 2 Type II certified.",
    visual: (
      <Shot src={img[7]}>
        <div className={`${glass} flex items-center gap-3`}>
          <span className="grid size-10 place-items-center rounded-full bg-lime-300 text-black">
            <ShieldCheck className="size-5" />
          </span>
          <div>
            <p className="font-medium">All systems protected</p>
            <p className="text-xs text-white/60">Last audit passed 2 days ago</p>
          </div>
        </div>
      </Shot>
    ),
  },
];

export default function Demo(p: Record<string, unknown>) {
  return <FeatureShowcase features={features} {...p} />;
}
