"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { GITHUB_URL, SITE_NAME } from "@/lib/site";
import { GitHubIcon } from "./icons";
import { buttonVariants } from "@/registry/items/button/button";
import { ScrollArea } from "@/registry/items/scroll-area/scroll-area";

export function PromoCard() {
  return (
    <div className="relative overflow-hidden rounded-2xl border bg-card p-6">
      <div aria-hidden className="absolute -right-10 -top-10 size-32 rounded-full bg-primary/25 blur-3xl" />
      <p className="relative font-display text-lg font-bold">{SITE_NAME}</p>
      <p className="relative mt-2 text-sm leading-relaxed text-muted-foreground">
        Free and open source. Copy anything, keep the code, and star the repo if it helped.
      </p>
      <a
        href={GITHUB_URL}
        target="_blank"
        rel="noreferrer"
        className={buttonVariants({ size: "sm", className: "relative mt-4 rounded-full" })}
      >
        <GitHubIcon className="size-4" /> Star on GitHub
      </a>
    </div>
  );
}

export function RailCard({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="rounded-2xl border bg-card p-5">
      <p className="mb-3 font-display font-semibold">{title}</p>
      {children}
    </div>
  );
}

export function Toc({ items }: { items: { id: string; label: string }[] }) {
  return (
    <RailCard title="On this page">
      <ul className="space-y-2 text-sm">
        {items.map((i) => (
          <li key={i.id}>
            <Link href={`#${i.id}`} className="text-muted-foreground hover:text-foreground">
              {i.label}
            </Link>
          </li>
        ))}
      </ul>
    </RailCard>
  );
}

export function RightRail({ children }: { children: ReactNode }) {
  return (
    <aside className="sticky top-16 hidden h-[calc(100dvh-4rem)] w-72 shrink-0 2xl:block">
      <ScrollArea className="h-full" viewportClassName="py-8">
        <div className="space-y-4">{children}</div>
      </ScrollArea>
    </aside>
  );
}
