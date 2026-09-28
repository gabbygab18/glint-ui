"use client";

import { Check, Sparkles } from "lucide-react";
import { demoImages } from "../../demo-kit";
import { FlashyCard } from "./flashy-card";

const [photo, avatar] = [demoImages(3, 640, 420)[2], demoImages(5, 120, 120)[4]];

export default function Demo(p: Record<string, unknown>) {
  return (
    <div className="flex flex-wrap items-center justify-center gap-6 p-6">
      <FlashyCard {...p} className="hidden w-64 md:block">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={photo} alt="" className="h-36 w-full object-cover" />
        <div className="p-5">
          <p className="text-xs uppercase tracking-widest text-muted-foreground">Field notes</p>
          <h3 className="mt-1 text-lg font-semibold text-foreground">Light over Lofoten</h3>
          <p className="mt-1 text-sm text-muted-foreground">Six nights chasing the aurora above the Arctic circle.</p>
        </div>
      </FlashyCard>

      <FlashyCard {...p} className="w-72">
        <div className="p-6">
          <div className="flex items-center justify-between">
            <p className="font-medium text-foreground">Pro</p>
            <span className="flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-xs text-foreground">
              <Sparkles className="size-3" /> Popular
            </span>
          </div>
          <p className="mt-4 text-4xl font-semibold tracking-tight text-foreground">
            $24<span className="text-base font-normal text-muted-foreground"> /month</span>
          </p>
          <ul className="mt-5 space-y-2.5 text-sm text-muted-foreground">
            {["Unlimited projects", "Realtime collaboration", "Custom domains", "Priority support"].map((f) => (
              <li key={f} className="flex items-center gap-2">
                <Check className="size-4 text-emerald-400" /> {f}
              </li>
            ))}
          </ul>
          <button
            type="button"
            className="mt-6 w-full rounded-xl bg-primary py-2.5 text-sm font-medium text-primary-foreground outline-none transition-opacity hover:opacity-90 focus-visible:ring-2 focus-visible:ring-ring"
          >
            Upgrade to Pro
          </button>
        </div>
      </FlashyCard>

      <FlashyCard {...p} className="hidden w-64 lg:block">
        <div className="flex flex-col items-center p-6 text-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={avatar} alt="" className="size-16 rounded-full object-cover ring-2 ring-border" />
          <h3 className="mt-3 font-semibold text-foreground">Maya Chen</h3>
          <p className="text-sm text-muted-foreground">Design Engineer</p>
          <div className="mt-5 grid w-full grid-cols-3 gap-2 text-center">
            {[
              ["128", "Posts"],
              ["9.4k", "Followers"],
              ["312", "Following"],
            ].map(([n, l]) => (
              <div key={l} className="rounded-lg bg-muted/60 py-2">
                <p className="text-sm font-semibold text-foreground">{n}</p>
                <p className="text-[11px] text-muted-foreground">{l}</p>
              </div>
            ))}
          </div>
        </div>
      </FlashyCard>
    </div>
  );
}
