import { ArrowRight, Check, FileCode2, Folder, Search, SlidersHorizontal, Terminal } from "@/components/site-icons";
import Link from "next/link";
import type { ReactNode } from "react";
import { CategoryShowcase, type ShowcaseCategory } from "@/components/category-showcase";
import { Cta } from "@/components/cta";
import { Hero } from "@/components/hero";
import { Logo } from "@/components/icons";
import { InstallBuilder } from "@/components/install-builder";
import { stackLogos } from "@/components/stack-logo";
import { CATEGORIES, bySlug, inCategory, registry } from "@/registry";
import { Marquee } from "@/registry/items/marquee/marquee";

const BLURBS: Record<string, string> = {
  "text-animations": "Headlines that type, scramble, rise and roll into place.",
  animations: "Cursor trails, hover effects and scroll reveals for any element.",
  backgrounds: "Canvas and WebGL scenes that sit behind your content and follow the pointer.",
  components: "Galleries, menus, cards and carousels with the motion built in.",
  buttons: "Buttons that pull, burn, glow and spring when pressed.",
  "micro-interactions": "Toggles, checks and fields: the small moments that make an app feel alive.",
  primitives: "Accessible basics like dialogs, tabs, selects and toasts, styled to match.",
  widgets: "Mascots, rings and playful widgets. Glint lives here.",
};

const REASONS = [
  { tag: "Own it", body: "One file per component. No package to update, no wrapper API to learn." },
  { tag: "shadcn", body: "Installs with the shadcn CLI and uses the same theme tokens, light and dark." },
  { tag: "Fast", body: "Canvas and WebGL effects pause offscreen and respect reduced motion." },
  { tag: "Accessible", body: "Real text for screen readers, keyboard support and visible focus." },
];

const BUILDER = ["frost-tiles", "letter-rise", "bloom-menu", "skeleton-swap", "price-toggle", "pin-matrix", "tilt-card", "glint-bot"];

/** Small centered pill with the logo, above each section title. */
function Eyebrow({ children }: { children: ReactNode }) {
  return (
    <span className="mx-auto flex w-fit items-center gap-1.5 rounded-full border bg-card px-3 py-1 text-xs font-medium text-muted-foreground shadow-sm">
      <Logo className="size-3.5" />
      {children}
    </span>
  );
}

function SectionTitle({ eyebrow, title, accent, body }: { eyebrow: string; title: string; accent: string; body?: string }) {
  return (
    <div className="mx-auto max-w-2xl text-center">
      <Eyebrow>{eyebrow}</Eyebrow>
      <h2 className="mt-5 text-balance font-display text-4xl font-bold tracking-tight sm:text-5xl">
        {title} <span className="text-highlight">{accent}</span>
      </h2>
      {body && <p className="mx-auto mt-4 max-w-xl text-balance text-muted-foreground">{body}</p>}
    </div>
  );
}

/** A soft tile holding a tiny mock of the product, with a title and line under it. */
function ToolCard({ title, body, children }: { title: string; body: string; children: ReactNode }) {
  return (
    <div className="flex flex-col rounded-3xl bg-muted/60 p-5 sm:p-6">
      <div className="flex-1 rounded-2xl border bg-background p-4 shadow-sm">{children}</div>
      <h3 className="mt-6 font-display text-lg font-bold">{title}</h3>
      <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{body}</p>
    </div>
  );
}

export default function Home() {
  const showcase: ShowcaseCategory[] = CATEGORIES.flatMap((c) => {
    const items = inCategory(c.id);
    if (!items.length) return [];
    return [{ id: c.id, label: c.label, icon: c.icon, count: items.length, blurb: BLURBS[c.id] ?? "", examples: items.slice(0, 4).map((e) => ({ slug: e.slug, name: e.name })) }];
  });
  const builderItems = BUILDER.flatMap((slug) => {
    const e = bySlug.get(slug);
    return e ? [{ slug, name: e.name, dependencies: e.dependencies ?? [] }] : [];
  });

  return (
    <main>
      <Hero count={registry.length} categories={showcase.length} />

      <section aria-label="Built with" className="py-10">
        <Marquee items={stackLogos} speed={50} hoverSpeed={0} gap={72} ariaLabel="Built with" />
      </section>

      {/* About: stat tiles beside the reasons, like a product fact sheet. */}
      <section className="relative">
        <div aria-hidden className="grid-lines absolute inset-0 -z-10" />
        <div className="mx-auto max-w-6xl px-6 py-20 sm:py-24">
          <SectionTitle
            eyebrow="Why Glint"
            title="Motion that ships,"
            accent="code you keep"
            body="Every component is plain React and Tailwind in a single file. Install it, read it, change it."
          />
          <div className="mt-14 grid items-center gap-16 lg:grid-cols-2 lg:gap-12">
            <div className="relative mx-auto w-full max-w-md">
              <div className="aspect-[4/3] rounded-[2rem] border bg-gradient-to-br from-primary/25 via-card to-card p-8 sm:p-10">
                <Logo className="size-20 drop-shadow-[0_18px_30px_rgba(120,160,20,0.35)] sm:size-28" />
              </div>
              <dl
                className="dark absolute -bottom-8 -right-2 grid w-60 grid-cols-2 gap-2 rounded-2xl p-2 text-white shadow-2xl sm:-right-8"
                style={{ background: "linear-gradient(160deg, oklch(0.24 0.035 128), oklch(0.16 0.02 125))" }}
              >
                {[
                  { value: `${registry.length}`, label: "Components" },
                  { value: `${showcase.length}`, label: "Categories" },
                  { value: "1", label: "File each" },
                  { value: "2", label: "Themes" },
                ].map((s) => (
                  <div key={s.label} className="rounded-xl bg-white/[0.06] p-3">
                    <dt className="text-[11px] text-white/60">{s.label}</dt>
                    <dd className="font-display text-2xl font-bold text-[#d9ff6b]">{s.value}</dd>
                  </div>
                ))}
              </dl>
            </div>

            <div>
              <h3 className="font-display text-2xl font-bold">Built to be copied</h3>
              <ul className="mt-6 grid gap-4">
                {REASONS.map((r) => (
                  <li key={r.tag} className="flex items-start gap-4">
                    <span className="w-24 shrink-0 rounded-full bg-highlight/12 px-3 py-1 text-center text-xs font-semibold text-highlight">{r.tag}</span>
                    <p className="text-sm leading-relaxed text-muted-foreground">{r.body}</p>
                  </li>
                ))}
              </ul>
              <Link
                href="/docs"
                className="mt-8 inline-flex items-center gap-2 rounded-full bg-[#141a0f] py-2 pl-5 pr-2 text-sm font-semibold text-white"
              >
                Read the docs
                <span className="grid size-7 place-items-center rounded-full bg-[#d9ff6b] text-[#141a0f]">
                  <ArrowRight className="size-3.5" />
                </span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-20 sm:py-24">
        <SectionTitle eyebrow="Categories" title="Everything that moves," accent="sorted for you" />
        <div className="mt-10">
          <CategoryShowcase categories={showcase} />
        </div>
      </section>

      {/* How it works: four tiles, each with a tiny mock of that step. */}
      <section className="px-4 py-10 sm:px-6">
        <div className="mx-auto max-w-6xl rounded-[2.25rem] border bg-card px-5 py-16 shadow-sm sm:px-10">
          <SectionTitle
            eyebrow="How it works"
            title="From idea to your repo,"
            accent="in minutes"
            body="Everything happens in the browser and one terminal command."
          />
          <div className="mt-12 grid gap-4 md:grid-cols-2">
            <ToolCard title="Find it fast" body="Search all components with Ctrl K, or browse by category.">
              <div className="flex items-center gap-2 rounded-xl border px-3 py-2 text-sm text-muted-foreground">
                <Search className="size-4" /> tilt
                <span className="ml-auto rounded border px-1.5 text-[10px]">Ctrl K</span>
              </div>
              <ul className="mt-3 grid gap-1.5 text-sm">
                {[
                  ["Tilt Card", "Components"],
                  ["Tilt Blocks", "Animations"],
                  ["Lean Card", "Components"],
                ].map(([n, c], k) => (
                  <li key={n} className={`flex items-center justify-between rounded-lg px-3 py-2 ${k === 0 ? "bg-muted" : ""}`}>
                    {n}
                    <span className="text-xs text-muted-foreground">{c}</span>
                  </li>
                ))}
              </ul>
            </ToolCard>

            <ToolCard title="Tweak it live" body="Every prop has a control, so you can tune it before you copy.">
              <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                <SlidersHorizontal className="size-3.5" /> Playground
              </div>
              {[
                ["Strength", "72%"],
                ["Speed", "40%"],
              ].map(([n, w]) => (
                <div key={n} className="mt-4">
                  <div className="flex justify-between text-xs">
                    <span>{n}</span>
                    <span className="text-muted-foreground">{w}</span>
                  </div>
                  <div className="mt-2 h-1.5 rounded-full bg-muted">
                    <div className="relative h-full rounded-full bg-primary" style={{ width: w }}>
                      <span className="absolute -right-2 -top-1 size-3.5 rounded-full border-2 border-primary bg-background" />
                    </div>
                  </div>
                </div>
              ))}
              <div className="mt-4 flex items-center justify-between text-xs">
                Glare
                <span className="flex h-5 w-9 items-center justify-end rounded-full bg-primary p-0.5">
                  <span className="size-4 rounded-full bg-background" />
                </span>
              </div>
            </ToolCard>

            <ToolCard title="Install with one command" body="The shadcn CLI adds the file and any npm packages it needs.">
              <div className="rounded-xl bg-[#141a0f] p-3 font-mono text-xs leading-6 text-white/80">
                <p>
                  <span className="text-[#d9ff6b]">$</span> npx shadcn add @glint-ui/tilt-card
                </p>
                <p className="flex items-center gap-1.5 text-white/60">
                  <Check className="size-3 text-[#d9ff6b]" /> Created components/ui/tilt-card.tsx
                </p>
                <p className="flex items-center gap-1.5 text-white/60">
                  <Check className="size-3 text-[#d9ff6b]" /> Installed motion
                </p>
                <p className="flex items-center gap-1.5 text-white/60">
                  <Terminal className="size-3" /> Done
                </p>
              </div>
            </ToolCard>

            <ToolCard title="Own the code" body="It is a normal file in your project. Change anything, nothing to keep in sync.">
              <ul className="grid gap-1 font-mono text-xs">
                <li className="flex items-center gap-2 text-muted-foreground">
                  <Folder className="size-3.5" /> components/ui
                </li>
                {["button.tsx", "tilt-card.tsx", "dialog.tsx"].map((f) => (
                  <li
                    key={f}
                    className={`ml-4 flex items-center gap-2 rounded-lg px-2 py-1.5 ${f === "tilt-card.tsx" ? "bg-highlight/12 font-semibold text-highlight" : "text-muted-foreground"}`}
                  >
                    <FileCode2 className="size-3.5" /> {f}
                    {f === "tilt-card.tsx" && <span className="ml-auto rounded-full bg-highlight px-1.5 text-[10px] text-background">yours</span>}
                  </li>
                ))}
              </ul>
            </ToolCard>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-20 sm:py-24">
        <SectionTitle
          eyebrow="Install builder"
          title="Build your command"
          accent="before you install"
          body="Pick a few components and a package manager. Copy the line, paste it in your terminal."
        />
        <div className="mt-12">
          <InstallBuilder items={builderItems} />
        </div>
      </section>

      <Cta />
    </main>
  );
}
