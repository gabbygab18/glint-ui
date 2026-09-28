"use client";

import { ArrowRight } from "lucide-react";
import { LampHero } from "./lamp-hero";

export default function Demo(p: Record<string, unknown>) {
  return (
    <LampHero className="absolute inset-0" {...p}>
      <a
        href="#"
        className="inline-flex h-11 items-center gap-2 rounded-full bg-primary px-5 text-sm font-medium text-primary-foreground outline-none transition-[scale,box-shadow] hover:shadow-[0_0_24px] hover:shadow-primary/40 focus-visible:ring-2 focus-visible:ring-ring/60 active:scale-[0.97]"
      >
        Get started <ArrowRight className="size-4" />
      </a>
      <a
        href="#"
        className="inline-flex h-11 items-center rounded-full border border-border bg-background/40 px-5 text-sm font-medium text-foreground backdrop-blur outline-none transition-colors hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring/60"
      >
        Read the docs
      </a>
    </LampHero>
  );
}
