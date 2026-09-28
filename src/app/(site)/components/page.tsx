import type { Metadata } from "next";
import { ComponentGrid, QuickNav } from "@/components/component-grid";
import { PromoCard, RailCard, RightRail } from "@/components/right-rail";
import { registry } from "@/registry";

export const metadata: Metadata = {
  title: "Components",
  description: `${registry.length} animated, accessible React components. Copy the source or install with the shadcn CLI.`,
};

export default function ComponentsPage() {
  return (
    <>
      <main className="min-w-0 flex-1 py-10">
        <h1 className="font-display text-5xl font-bold tracking-tight sm:text-6xl">Components</h1>
        <p className="mb-10 mt-4 max-w-2xl text-lg text-muted-foreground">
          {registry.length} animated components across text, motion, backgrounds, UI and widgets. Copy the source or
          install one with the shadcn CLI.
        </p>
        <ComponentGrid />
      </main>
      <RightRail>
        <PromoCard />
        <RailCard title="Quick navigation">
          <QuickNav />
        </RailCard>
      </RightRail>
    </>
  );
}
