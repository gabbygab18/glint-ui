import { ArrowUpRight, Box, Layers, LayoutGrid, MousePointerClick, Smile, Sparkles, Type, Zap } from "lucide-react";
import Link from "next/link";
import type { CSSProperties } from "react";
import { Cta } from "@/components/cta";
import { STACK } from "@/components/stack-logos";
import { Hero } from "@/components/hero";
import { CATEGORIES, inCategory, registry } from "@/registry";
import { GlowBorder } from "@/registry/items/glow-border/glow-border";
import { Marquee } from "@/registry/items/marquee/marquee";
import { SpotlightCard } from "@/registry/items/spotlight-card/spotlight-card";
import { TiltCard } from "@/registry/items/tilt-card/tilt-card";
import { SITE_URL } from "@/lib/site";

const icons = { type: Type, sparkles: Sparkles, layers: Layers, layout: LayoutGrid, pointer: MousePointerClick, zap: Zap, box: Box, smile: Smile };

const features = [
  { title: "Copy, paste, own it", body: "One file per component. No package, no version lock, no wrapper API to learn." },
  { title: "shadcn native", body: "Install with the shadcn CLI. Uses the same theme tokens, so it matches your app in light and dark." },
  { title: "Fast by default", body: "Canvas and WebGL effects pause offscreen, cap pixel ratio and respect reduced motion." },
  { title: "Accessible", body: "Real text for screen readers, keyboard support on interactive pieces, visible focus." },
];

export default function Home() {
  return (
    <main>
      <Hero count={registry.length} installCmd={`npx shadcn@latest add ${SITE_URL}/r/split-text.json`} />

      <section aria-label="Built with" className="border-b py-8">
        <Marquee
          speed={40}
          gap={56}
          items={STACK.map((s) => (
            <span
              key={s.name}
              className="group flex items-center gap-3 text-muted-foreground transition-colors hover:text-[var(--brand)]"
              style={{ "--brand": s.color ?? "var(--foreground)" } as CSSProperties}
            >
              {s.path ? (
                <svg viewBox="0 0 24 24" aria-hidden className="size-7 fill-current">
                  <path d={s.path} />
                </svg>
              ) : s.name === "WebGL" ? (
                <Box aria-hidden className="size-7" strokeWidth={1.75} />
              ) : (
                <span aria-hidden className="grid size-7 place-items-center rounded-md bg-current">
                  <span className="font-display text-sm font-black text-background">M</span>
                </span>
              )}
              <span className="font-display text-xl font-semibold">{s.name}</span>
            </span>
          ))}
        />
      </section>

      <section className="mx-auto max-w-[90rem] px-6 py-24">
        <div className="mb-12 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="text-sm font-medium text-primary">Categories</p>
            <h2 className="mt-2 font-display text-4xl font-bold tracking-tight sm:text-5xl">Everything that moves</h2>
          </div>
          <Link href="/components" className="text-sm text-muted-foreground hover:text-foreground">
            View all {registry.length} →
          </Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {CATEGORIES.map((c) => {
            const items = inCategory(c.id);
            if (!items.length) return null;
            const Icon = icons[c.icon];
            return (
              <SpotlightCard key={c.id} className="!rounded-3xl !border-border !bg-card !p-0">
                <Link href={`/components/${items[0].slug}`} className="group block p-6">
                  <span className="grid size-10 place-items-center rounded-xl bg-primary/15 text-primary">
                    <Icon className="size-5" />
                  </span>
                  <p className="mt-8 flex items-center justify-between font-display text-lg font-bold">
                    {c.label}
                    <ArrowUpRight className="size-4 text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">{items.length} components</p>
                </Link>
              </SpotlightCard>
            );
          })}
        </div>
      </section>

      <section className="border-y bg-card/40">
        <div className="mx-auto grid max-w-[90rem] items-center gap-12 px-6 py-24 lg:grid-cols-2">
          <div>
            <p className="text-sm font-medium text-primary">Why {"it's"} different</p>
            <h2 className="mt-2 font-display text-4xl font-bold tracking-tight sm:text-5xl">Yours from the first paste</h2>
            <div className="mt-10 grid gap-8 sm:grid-cols-2">
              {features.map((f) => (
                <div key={f.title}>
                  <h3 className="font-display text-lg font-bold">{f.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{f.body}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="flex flex-col items-center gap-8">
            <TiltCard className="rounded-3xl">
              <div className="w-80 rounded-3xl border bg-background p-6 shadow-2xl">
                <div className="mb-16 flex items-center justify-between">
                  <span className="size-10 rounded-xl bg-gradient-to-br from-primary to-cyan-400" />
                  <span className="rounded-full border px-2 py-0.5 text-xs text-muted-foreground">tilt-card.tsx</span>
                </div>
                <p className="font-display text-xl font-bold">Tilt Card</p>
                <p className="mt-1 text-sm text-muted-foreground">Hover me. This is the same file you would copy.</p>
              </div>
            </TiltCard>
            <GlowBorder radius={9999} background="var(--background)">
              <Link href="/components/tilt-card" className="block px-6 py-3 text-sm font-medium">
                See the source →
              </Link>
            </GlowBorder>
          </div>
        </div>
      </section>

      <Cta />
    </main>
  );
}
