import type { Metadata } from "next";
import Link from "next/link";
import { Prose } from "@/components/prose";
import { PromoCard, RightRail } from "@/components/right-rail";
import { CATEGORIES, inCategory, registry } from "@/registry";
import { SITE_NAME } from "@/lib/site";

export const metadata: Metadata = { title: "Introduction" };

export default function IntroductionPage() {
  return (
    <>
      <main className="min-w-0 flex-1 py-10">
        <h1 className="font-display text-5xl font-bold tracking-tight">Introduction</h1>
        <p className="mb-10 mt-4 max-w-2xl text-lg text-muted-foreground">
          {SITE_NAME} is a registry of {registry.length} animated React components. You copy them into your project
          and own the code.
        </p>
        <Prose>
          <h2>Not a package</h2>
          <p>
            There is nothing to install and keep up to date. Each component is one file you paste into{" "}
            <code>components/ui</code>, or add with the shadcn CLI. Change anything: it is your code now.
          </p>
          <h2>Built on shadcn conventions</h2>
          <p>
            Components use the standard shadcn theme tokens (<code>bg-background</code>, <code>text-primary</code>,{" "}
            <code>border-border</code>…), so they pick up your theme in light and dark mode without extra setup.
          </p>
          <h2>What is inside</h2>
          <ul>
            {CATEGORIES.map((c) => (
              <li key={c.id}>
                <strong>{c.label}</strong>: {inCategory(c.id).length} components
              </li>
            ))}
          </ul>
          <h2>Credits</h2>
          <p>
            Many effect ideas were inspired by React Bits and ScrollX UI. Their code is not redistributed here: every
            component in this registry is an original implementation, except those marked with a credit, such as the
            Calamansi components, which are ported under their MIT license.
          </p>
          <p>
            <Link href="/docs/installation" className="font-medium text-primary hover:underline">
              Next: Installation →
            </Link>
          </p>
        </Prose>
      </main>
      <RightRail>
        <PromoCard />
      </RightRail>
    </>
  );
}
