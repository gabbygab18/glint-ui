import Link from "next/link";
import type { ReactNode } from "react";
import { CategoryShowcase, type ShowcaseCategory } from "@/components/category-showcase";
import { Cta } from "@/components/cta";
import { Hero } from "@/components/hero";
import { Logo } from "@/components/icons";
import { InstallBuilder } from "@/components/install-builder";
import { ArrowDot, ArrowRight, CheckCircle, Clock, Package, SlidersHorizontal, Star } from "@/components/site-icons";
import { stackLogos } from "@/components/stack-logo";
import { CATEGORIES, bySlug, categoryLabel, inCategory, registry } from "@/registry";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/registry/items/accordion/accordion";
import { Marquee } from "@/registry/items/marquee/marquee";
import { PinMatrix } from "@/registry/items/pin-matrix/pin-matrix";
import { Tally } from "@/registry/items/tally/tally";

const SECTION = "px-6 py-14 md:px-10 md:py-20";

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

const BUILDER = ["frost-tiles", "letter-rise", "bloom-menu", "skeleton-swap", "price-toggle", "pin-matrix", "tilt-card", "glint-bot"];
const LATEST = ["bloom-menu", "size-shift", "reaction-bar", "price-toggle", "goal-ring"];

const FAQS = [
  { q: "Is Glint UI really free?", a: "Yes. Every component is free to use in personal and commercial projects. There is no sign-up and no paid tier." },
  { q: "Do I need shadcn/ui?", a: "No. You can copy any component by hand. The shadcn CLI just makes installing faster and pulls in the npm packages a component needs." },
  { q: "Will it match my theme?", a: "Components use the shadcn color tokens, like bg-card and text-muted-foreground, so they follow your light, dark and custom themes." },
  { q: "Does it work with reduced motion?", a: "Yes. Animations respect prefers-reduced-motion, and canvas or WebGL effects draw a single still frame instead." },
  { q: "Can I change the code?", a: "That is the point. Each component is one file in your project. Rename it, restyle it, delete what you don't need." },
  { q: "Which React versions are supported?", a: "React 19 with Tailwind CSS v4. Most components also run on React 18 with small changes." },
];

function Eyebrow({ children }: { children: ReactNode }) {
  return (
    <span className="btn-glossy inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs text-muted-foreground">
      <Logo className="size-3.5" />
      {children}
    </span>
  );
}

function SplitHeading({ eyebrow, title, text, href }: { eyebrow: string; title: string; text: string; href?: string }) {
  return (
    <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
      <div>
        <Eyebrow>{eyebrow}</Eyebrow>
        <h2 className="mt-3 max-w-md font-display text-3xl font-semibold leading-tight tracking-tight md:text-4xl">{title}</h2>
      </div>
      <div className="max-w-xs">
        <p className="text-sm leading-relaxed text-muted-foreground">{text}</p>
        {href && (
          <Link href={href} className="group mt-2 inline-flex items-center gap-1 text-sm font-medium hover:underline">
            View all <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
        )}
      </div>
    </div>
  );
}

export default function Home() {
  const showcase: ShowcaseCategory[] = CATEGORIES.flatMap((c) => {
    const items = inCategory(c.id);
    if (!items.length) return [];
    return [{ id: c.id, label: c.label, count: items.length, blurb: BLURBS[c.id] ?? "", examples: items.slice(0, 4).map((e) => ({ slug: e.slug, name: e.name })) }];
  });
  const pick = (slugs: string[]) => slugs.flatMap((s) => (bySlug.has(s) ? [bySlug.get(s)!] : []));
  const latest = pick(LATEST);
  const builderItems = pick(BUILDER).map((e) => ({ slug: e.slug, name: e.name, dependencies: e.dependencies ?? [] }));

  return (
    <main className="mx-auto w-full max-w-[1240px]">
      <Hero
        count={registry.length}
        categories={showcase.length}
        recent={latest.slice(0, 2).map((e) => ({ slug: e.slug, name: e.name, category: categoryLabel(e.category) }))}
      />

      <section aria-label="Built with" className="pb-16">
        <p className="px-6 pb-6 text-center text-sm text-muted-foreground">
          <span className="font-medium text-highlight">Built with the tools</span> fast teams already use
        </p>
        <div className="border-y py-5">
          <Marquee items={stackLogos} speed={40} hoverSpeed={0} gap={64} ariaLabel="Built with" />
        </div>
      </section>

      <section aria-label="Glint UI in numbers" className="px-6 pb-8 md:px-10">
        <dl className="grid grid-cols-2 gap-y-8 md:grid-cols-4">
          {[
            { value: registry.length, label: "Components", note: "Free for any project" },
            { value: showcase.length, label: "Categories", note: "Text to widgets" },
            { value: 1, label: "File each", note: "Nothing to keep in sync" },
            { value: 2, label: "Themes", note: "Light and dark built in" },
          ].map((s, k) => (
            <div key={s.label} className={`flex flex-col px-5 ${k % 2 ? "border-l" : ""} ${k === 2 ? "md:border-l" : ""}`}>
              <dt className="order-2 mt-2 text-sm font-medium">{s.label}</dt>
              <dd className="order-1 font-display text-4xl font-semibold tracking-tight">
                <Tally to={s.value} duration={1600} />
              </dd>
              <dd className="order-3 text-xs text-muted-foreground">{s.note}</dd>
            </div>
          ))}
        </dl>
      </section>

      {/* Why Glint: three cards, each with a small product mock. */}
      <section className={SECTION}>
        <div className="text-center">
          <Eyebrow>Why Glint</Eyebrow>
          <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight md:text-4xl">Everything for Smarter Interfaces</h2>
          <p className="mt-3 text-sm text-muted-foreground">Motion that ships fast, stays accessible and costs nothing.</p>
        </div>
        <div className="mt-10 grid gap-4 md:grid-cols-3">
          <div className="clay-well rounded-[2rem] p-5">
            <span className="btn-glossy grid size-11 place-items-center rounded-2xl">
              <SlidersHorizontal className="size-5" />
            </span>
            <h3 className="mt-3 font-semibold">Live Playground</h3>
            <p className="text-xs text-muted-foreground">Tune every prop before you copy.</p>
            <div className="mt-5 space-y-4 rounded-2xl bg-card p-4">
              <p className="text-xs font-semibold">Tilt Card</p>
              {[
                ["Max tilt", 72],
                ["Scale", 40],
                ["Glare", 85],
              ].map(([n, v]) => (
                <div key={n}>
                  <div className="flex justify-between text-[11px] text-muted-foreground">
                    <span>{n}</span>
                    <span>{v}%</span>
                  </div>
                  <div className="mt-1.5 h-1.5 rounded-full bg-muted">
                    <div className="h-full rounded-full bg-[#141a0f] dark:bg-[#d9ff6b]" style={{ width: `${v}%` }} />
                  </div>
                </div>
              ))}
              <Link href="/components/tilt-card" className="btn-glossy block rounded-full py-2 text-center text-xs font-semibold">
                Open Playground
              </Link>
            </div>
          </div>

          <div className="relative min-h-[380px] overflow-hidden rounded-3xl bg-[#0b0f08] p-5 text-white">
            {/* A live component, not a picture: the dots light up under the pointer. */}
            <div className="absolute inset-0">
              <PinMatrix gap={22} dotSize={2} baseColor="#2e3a1f" activeColor="#d9ff6b" proximity={140} />
            </div>
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[#0b0f08] via-[#0b0f08]/40 to-transparent" />
            <span className="pointer-events-none absolute bottom-5 left-5 rounded-full bg-white/10 px-3 py-1 text-[11px] text-white/80 backdrop-blur">
              Live: Pin Matrix · move your cursor here
            </span>
            <div className="pointer-events-none relative">
              <span className="grid size-11 place-items-center rounded-2xl bg-[#d9ff6b] text-[#141a0f]">
                <Package className="size-5" />
              </span>
              <h3 className="mt-3 text-lg font-semibold">{registry.length} Free Components</h3>
              <p className="max-w-[220px] text-xs text-white/80">Text, motion, backgrounds, UI and mascots. Glint included.</p>
            </div>
          </div>

          <div className="clay-well rounded-[2rem] p-5">
            <span className="btn-glossy grid size-11 place-items-center rounded-2xl">
              <CheckCircle className="size-5" />
            </span>
            <h3 className="mt-3 font-semibold">Install in One Line</h3>
            <p className="text-xs text-muted-foreground">The shadcn CLI does the copying for you.</p>
            <div className="mt-5 rounded-2xl bg-card p-4 text-center">
              <CheckCircle className="mx-auto size-10 text-emerald-500" />
              <p className="mt-2 text-sm font-semibold">Component Installed</p>
              <p className="font-mono text-[11px] text-muted-foreground">@glint-ui/frost-tiles</p>
              <dl className="mt-4 space-y-2 text-left text-[11px]">
                {[
                  ["File", "components/ui/frost-tiles.tsx"],
                  ["Packages", "None"],
                  ["Lock-in", "Zero"],
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between gap-2">
                    <dt className="text-muted-foreground">{k}</dt>
                    <dd className="truncate font-medium">{v}</dd>
                  </div>
                ))}
              </dl>
              <Link href="/docs/installation" className="btn-glossy mt-4 block rounded-full py-2 text-xs font-semibold">
                Read the Setup
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features: two tall cards with product mocks. */}
      <section className={SECTION}>
        <SplitHeading
          eyebrow="Library Features"
          title="Everything You Need to Ship Motion"
          href="/components"
          text="Organized categories, live previews and a playground for every component, all free."
        />
        <div className="mt-10 grid gap-4 md:grid-cols-2">
          <div className="clay-well flex h-[560px] flex-col overflow-hidden rounded-[2rem] px-8 pt-8">
            <h3 className="text-xl font-semibold">Organized by Category</h3>
            <p className="mt-1 max-w-sm text-sm text-muted-foreground">{showcase.length} categories, from headline effects to full widgets, each with a live preview.</p>
            <div className="clay relative mx-auto mt-8 w-[280px] flex-1 rounded-t-[2rem] border-b-0 bg-card p-4">
              <p className="text-xs text-muted-foreground">Library</p>
              <p className="text-2xl font-semibold tracking-tight">{registry.length} components</p>
              <ul className="mt-3 space-y-2">
                {showcase.map((c, k) => (
                  <li key={c.id} className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-2">
                      <span className="grid size-5 place-items-center rounded-full bg-muted text-[10px] font-semibold">{k + 1}</span>
                      {c.label}
                    </span>
                    <span className="text-muted-foreground">{c.count}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="clay-well flex h-[560px] flex-col overflow-hidden rounded-[2rem] px-8 pt-8">
            <h3 className="text-xl font-semibold">Live Previews</h3>
            <p className="mt-1 max-w-sm text-sm text-muted-foreground">Every component runs right on its page. Hover it, drag it, change its props, then copy.</p>
            <div className="relative mx-auto mt-10 h-72 w-full max-w-sm">
              {latest.slice(0, 3).map((e, k) => (
                <Link
                  key={e.slug}
                  href={`/components/${e.slug}`}
                  className="clay absolute inset-x-0 top-0 overflow-hidden rounded-[1.5rem] bg-card p-2 transition-transform duration-300 hover:-translate-y-2"
                  style={{ transform: `translateY(${k * 26}px) scale(${1 - (2 - k) * 0.05})`, zIndex: k }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element -- static thumbnail */}
                  <img src={`/thumbs/${e.slug}.webp`} alt="" className="aspect-[16/10] w-full rounded-[1.1rem] object-cover" />
                  <p className="flex items-center justify-between px-2 pt-2 text-sm font-semibold">
                    {e.name}
                    <span className="text-xs font-normal text-muted-foreground">{categoryLabel(e.category)}</span>
                  </p>
                </Link>
              ))}
            </div>
            <div className="mb-5 mt-auto flex justify-end">
              <span className="btn-ink flex items-center gap-2 rounded-full px-3 py-1 text-xs">
                <Star className="size-3.5 text-[#d9ff6b]" />
                {registry.length} previews · playground
              </span>
            </div>
          </div>
        </div>
      </section>

      <section className={`${SECTION} clay-well mx-2 rounded-[2rem] md:mx-4`}>
        <div className="mb-8">
          <Eyebrow>Categories</Eyebrow>
          <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight md:text-4xl">Your Complete Motion Library</h2>
        </div>
        <CategoryShowcase categories={showcase} />
      </section>

      {/* Newest components, laid out like a list of episodes. */}
      <section className={SECTION}>
        <SplitHeading eyebrow="Just Added" title="Fresh Components This Month" href="/components" text="New pieces land often. Each one is original, documented and ready to install." />
        <div className="mt-10 space-y-4">
          {latest.map((e) => (
            <Link key={e.slug} href={`/components/${e.slug}`} className="clay-well group grid gap-5 rounded-[2rem] p-3 md:grid-cols-[260px_1fr]">
              <div className="relative aspect-video overflow-hidden rounded-2xl bg-[#0b0f08]">
                {/* eslint-disable-next-line @next/next/no-img-element -- static thumbnail */}
                <img src={`/thumbs/${e.slug}.webp`} alt="" className="size-full object-cover transition-transform duration-500 group-hover:scale-105" />
              </div>
              <div className="flex flex-col justify-between gap-4 py-2 pr-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">New · {categoryLabel(e.category)}</p>
                  <p className="mt-2 font-display text-xl font-semibold leading-snug md:text-2xl">{e.name}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{e.description}</p>
                </div>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{e.dependencies?.length ? e.dependencies.join(" · ") : "No dependencies"}</span>
                  <span className="flex items-center gap-1">
                    <Clock className="size-3.5" /> Ready to install
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Three ways in, each shown as the actual code you would write. */}
      <section className={`${SECTION} clay-well mx-2 rounded-[2rem] md:mx-4`}>
        <SplitHeading eyebrow="Ways to Use It" title="Three Ways In, Same Result" text="Copy one file, install with the CLI, or start from a preset and change it. You always end up owning the code." />
        <ol className="mt-10 grid gap-4 md:grid-cols-3">
          {[
            {
              title: "Copy the file",
              note: "No setup. Open a component, copy its source, paste it into your project.",
              file: "components/ui/tilt-card.tsx",
              code: [["", "export function TiltCard({"], ["", "  maxTilt = 12, glare = true,"], ["", "}: TiltCardProps) { … }"]],
              href: "/components",
              cta: "Browse components",
            },
            {
              title: "Install with the CLI",
              note: "One command adds the file and any npm packages it needs.",
              file: "terminal",
              code: [["$", "npx shadcn@latest add \\"], ["", "  @glint-ui/tilt-card"], ["✓", "Created tilt-card.tsx"]],
              href: "/docs/installation",
              cta: "Set up the CLI",
              popular: true,
            },
            {
              title: "Make it yours",
              note: "Change props, classes or the code itself. It follows your shadcn theme.",
              file: "app/page.tsx",
              code: [["", "<TiltCard maxTilt={18}"], ["", "  className=\"rounded-3xl\">"], ["", "  …</TiltCard>"]],
              href: "/docs",
              cta: "Read the docs",
            },
          ].map((w, k) => (
            <li key={w.title} className="clay flex flex-col rounded-3xl bg-card p-6">
              <div className="flex items-center justify-between">
                <span className="btn-glossy grid size-10 place-items-center rounded-full font-display text-sm font-semibold">{String(k + 1).padStart(2, "0")}</span>
                {w.popular && <span className="rounded-full bg-[#d9ff6b] px-2.5 py-0.5 text-[11px] font-semibold text-[#141a0f]">Most popular</span>}
              </div>
              <h3 className="mt-5 font-display text-xl font-semibold">{w.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{w.note}</p>
              <div className="mt-6 flex-1 overflow-hidden rounded-2xl bg-[#0b0f08] font-mono text-[12px] leading-6 text-white/85">
                <p className="border-b border-white/10 px-4 py-2 text-[11px] text-white/45">{w.file}</p>
                <pre className="overflow-x-auto px-4 py-3">
                  {w.code.map(([mark, line], j) => (
                    <span key={j} className="block">
                      <span className="inline-block w-4 text-[#d9ff6b]">{mark}</span>
                      {line}
                    </span>
                  ))}
                </pre>
              </div>
              <Link href={w.href} className="btn-ink group mt-5 flex h-11 items-center justify-between rounded-full pl-5 pr-2 text-sm font-semibold">
                {w.cta}
                <ArrowDot />
              </Link>
            </li>
          ))}
        </ol>
      </section>

      <section className={SECTION}>
        <SplitHeading eyebrow="Install Builder" title="Build Your Command Before You Install" text="Pick a few components and a package manager. Copy the line, paste it in your terminal." />
        <div className="mt-10">
          <InstallBuilder items={builderItems} />
        </div>
      </section>

      <section className={`${SECTION} grid gap-10 md:grid-cols-[0.8fr_1.2fr]`}>
        <div>
          <Eyebrow>FAQ</Eyebrow>
          <h2 className="mt-3 font-display text-3xl font-semibold leading-tight tracking-tight md:text-4xl">Frequently Asked Questions</h2>
          <p className="mt-3 max-w-xs text-sm text-muted-foreground">Everything you need to know before your first install.</p>
          <Link href="/docs" className="btn-ink group mt-6 inline-flex h-11 items-center gap-2 rounded-full pl-5 pr-2 text-sm font-semibold">
            Read the Docs
            <ArrowDot />
          </Link>
        </div>
        <Accordion defaultValue={["q0"]} className="clay-well rounded-[2rem] px-5 py-1">
          {FAQS.map((f, k) => (
            <AccordionItem key={f.q} value={`q${k}`}>
              <AccordionTrigger>
                <span className="mr-3 text-xs text-muted-foreground">{String(k + 1).padStart(2, "0")}</span>
                {f.q}
              </AccordionTrigger>
              <AccordionContent>{f.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </section>

      <Cta />
    </main>
  );
}
