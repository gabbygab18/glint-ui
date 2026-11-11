import Link from "next/link";
import { ArrowRight, Bell, Copy, Search, SlidersHorizontal, Terminal } from "@/components/site-icons";
import { GlintBot } from "@/registry/items/glint-bot/glint-bot";
import { NorthGlow } from "@/registry/items/north-glow/north-glow";
import { Logo } from "./icons";

export interface HeroItem {
  slug: string;
  name: string;
  category: string;
}

/** Centered intro, then a photo-style card and a lit lime panel with an app mock. */
export function Hero({ count, categories, recent }: { count: number; categories: number; recent: HeroItem[] }) {
  return (
    <section className="pb-10">
      <div className="mx-auto max-w-3xl px-6 pt-14 text-center">
        <Link
          href="/components"
          className="btn-glossy inline-flex items-center gap-2 rounded-full py-1 pl-1 pr-3 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <span className="rounded-full bg-[#141a0f] px-2.5 py-0.5 text-xs font-semibold text-[#d9ff6b]">Free</span>
          {count} components, {categories} categories, 1 CLI
          <ArrowRight className="size-3.5" />
        </Link>
        <h1 className="mt-6 text-balance font-display text-4xl font-semibold leading-[1.06] tracking-tight md:text-[58px]">
          The Modern Way to Build <br className="hidden sm:block" />
          Interfaces That <span className="text-highlight">Move.</span>
        </h1>
        <p className="mx-auto mt-5 max-w-md text-[15px] leading-relaxed text-muted-foreground">
          Text effects, cursors, WebGL backgrounds and UI with motion built in. Copy a component or install it with the
          shadcn CLI, and the code is yours.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link href="/components" className="btn-ink inline-flex h-11 items-center rounded-full px-6 text-sm font-semibold transition-[filter] hover:brightness-125">
            Browse Components
          </Link>
          <Link href="/docs/installation" className="btn-glossy inline-flex h-11 items-center rounded-full px-6 text-sm font-semibold">
            See How It Works
          </Link>
        </div>
      </div>

      <div className="mt-12 grid gap-4 px-4 md:grid-cols-[1fr_2.1fr] md:px-10">
        {/* Left: a live background component with the newest components floating on top. */}
        <div className="clay rounded-[2.5rem] bg-card p-2.5">
          <div className="relative h-[340px] overflow-hidden rounded-[2rem] bg-[#0b0f08]">
            <NorthGlow colors={["#b5e61d", "#2dd4bf", "#365314"]} />
            <div className="absolute inset-x-4 bottom-4 space-y-2">
              {recent.map((r) => (
                <Link
                  key={r.slug}
                  href={`/components/${r.slug}`}
                  className="flex items-center gap-3 rounded-[1.25rem] bg-white/95 p-2.5 text-neutral-900 shadow-[0_10px_24px_-12px_rgb(15_23_42/0.4)] backdrop-blur transition-transform hover:-translate-y-0.5"
                >
                  <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-[#d9ff6b]">
                    <Logo className="size-6" />
                  </span>
                  <span className="min-w-0 flex-1 text-xs">
                    <span className="block truncate font-semibold">{r.name}</span>
                    <span className="block truncate text-neutral-500">New in {r.category}</span>
                  </span>
                  <span className="text-xs font-semibold">New</span>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Right: lit lime panel, an app mock rising from the bottom, Glint keeping watch. */}
        <div className="clay rounded-[2.5rem] bg-card p-2.5">
          <div className="lime-glow relative flex h-[340px] items-end justify-center overflow-hidden rounded-[2rem]">
            <span className="glass-pill absolute left-6 top-6 hidden rounded-full px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#141a0f] sm:inline-flex">
              Your project
            </span>
            <div className="absolute -bottom-6 left-2 hidden lg:block">
              <GlintBot size={200} wave label="Glint, waving hello" />
            </div>
            <AppCard />
            <div className="clay absolute bottom-14 right-6 hidden w-48 rounded-[1.5rem] bg-card p-4 xl:block">
              <div className="flex justify-between text-xs">
                <span className="font-medium">Bundle added</span>
                <span className="text-muted-foreground">4 files</span>
              </div>
              <div className="mt-2.5 h-1.5 overflow-hidden rounded-full bg-muted">
                <div className="h-full w-2/3 rounded-full bg-[#141a0f] dark:bg-[#d9ff6b]" />
              </div>
              <p className="mt-2 text-[11px] text-muted-foreground">No runtime package</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function AppCard() {
  const actions = [
    { Icon: Search, label: "Find" },
    { Icon: SlidersHorizontal, label: "Tweak" },
    { Icon: Copy, label: "Copy" },
    { Icon: Terminal, label: "Install" },
  ];
  return (
    <div className="clay relative z-10 w-[300px] rounded-t-[2rem] border-b-0 bg-card p-4 text-foreground">
      <div className="flex items-center justify-between">
        <span className="flex items-center gap-2 text-xs font-semibold">
          <Logo className="size-7" />
          My App
        </span>
        <Bell className="size-4 text-muted-foreground" />
      </div>
      <div className="clay-well mt-4 rounded-[1.5rem] p-3.5">
        <p className="text-[11px] text-muted-foreground">components/ui</p>
        <div className="mt-1 flex items-end justify-between">
          <p className="text-2xl font-semibold tracking-tight">4 installed</p>
          <span className="text-[11px] text-muted-foreground">all yours</span>
        </div>
        <div className="mt-3 grid grid-cols-4 gap-1 text-center text-[10px] text-muted-foreground">
          {actions.map(({ Icon, label }) => (
            <div key={label} className="flex flex-col items-center gap-1">
              <span className="btn-glossy grid size-9 place-items-center rounded-full">
                <Icon className="size-4" />
              </span>
              {label}
            </div>
          ))}
        </div>
      </div>
      <div className="clay-well mt-3 flex items-center gap-3 rounded-[1.5rem] p-3">
        <span className="btn-ink grid size-9 shrink-0 place-items-center rounded-full">
          <Terminal className="size-3.5" />
        </span>
        <div className="min-w-0 text-xs">
          <p className="font-semibold">Last installed</p>
          <p className="truncate font-mono text-muted-foreground">@glint-ui/bloom-menu</p>
        </div>
        <ArrowRight className="ml-auto size-4 shrink-0" />
      </div>
    </div>
  );
}
