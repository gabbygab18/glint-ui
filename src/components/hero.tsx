"use client";

import { ArrowRight, Box, Check, Layers, Sparkles, Terminal, Type } from "@/components/site-icons";
import Link from "next/link";
import { useRef, type CSSProperties, type PointerEvent } from "react";
import { GlintBot } from "@/registry/items/glint-bot/glint-bot";
import { buttonVariants } from "@/registry/items/button/button";
import { Header } from "./header";

// Floating cards drift against the pointer at different depths.
const depth = (px: number): CSSProperties => ({
  transform: `translate3d(calc(var(--px, 0) * ${px}px), calc(var(--py, 0) * ${px}px), 0)`,
  transition: "transform 0.4s cubic-bezier(.2,.7,.2,1)",
});

// A few lit grid cells, placed on the 64px grid so they line up with the lines.
const CELLS = [
  [3, 1],
  [12, 1],
  [14, 2],
  [8, 6],
  [17, 7],
  [1, 8],
];

const TRUST = ["One file per component", "Works with the shadcn CLI", "Free and open source"];

export function Hero({ count, categories }: { count: number; categories: number }) {
  const ref = useRef<HTMLDivElement>(null);

  const onMove = (e: PointerEvent<HTMLDivElement>) => {
    const el = ref.current!;
    const r = el.getBoundingClientRect();
    el.style.setProperty("--px", `${((e.clientX - r.left) / r.width - 0.5) * 2}`);
    el.style.setProperty("--py", `${((e.clientY - r.top) / r.height - 0.5) * 2}`);
  };

  return (
    <section className="px-2 pt-2 sm:px-3 sm:pt-3">
      {/* The card is always dark, like a brand-colored panel, in both site themes. */}
      <div
        ref={ref}
        onPointerMove={onMove}
        className="dark relative isolate overflow-hidden rounded-[1.75rem] text-foreground sm:rounded-[2.25rem]"
        style={{
          background:
            "radial-gradient(900px circle at 78% 18%, oklch(0.42 0.12 128 / 0.55), transparent 60%), radial-gradient(700px circle at 8% 100%, oklch(0.32 0.07 150 / 0.5), transparent 60%), linear-gradient(160deg, oklch(0.23 0.035 128), oklch(0.16 0.02 125))",
        }}
      >
        <div
          aria-hidden
          className="absolute inset-0 -z-10"
          style={{
            backgroundImage:
              "linear-gradient(to right, oklch(1 0 0 / 0.05) 1px, transparent 1px), linear-gradient(to bottom, oklch(1 0 0 / 0.05) 1px, transparent 1px)",
            backgroundSize: "64px 64px",
          }}
        >
          {CELLS.map(([x, y]) => (
            <span key={`${x}-${y}`} className="absolute size-16 bg-white/[0.035]" style={{ left: x * 64, top: y * 64 }} />
          ))}
        </div>

        <Header inset />

        <div className="mx-auto grid max-w-[90rem] items-center gap-10 px-6 pb-16 pt-10 sm:px-10 sm:pt-14 lg:grid-cols-[1.1fr_0.9fr] lg:pb-20">
          <div className="min-w-0">
            <Link
              href="/components"
              className="group inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.06] py-1 pl-1 pr-3 text-xs text-white/80 backdrop-blur hover:text-white"
            >
              <span className="rounded-full bg-primary px-2 py-0.5 font-semibold text-primary-foreground">{count}</span>
              animated components for <span className="font-semibold text-white">React</span>
              <ArrowRight className="size-3 transition-transform group-hover:translate-x-0.5" />
            </Link>

            <h1 className="mt-7 max-w-2xl text-balance font-display text-5xl font-bold leading-[1.04] tracking-tight text-white sm:text-6xl xl:text-7xl">
              Interfaces that move, <span className="text-primary">yours in one paste</span>
            </h1>

            <p className="mt-6 max-w-xl text-lg leading-relaxed text-white/70">
              Text effects, cursors, WebGL backgrounds, UI and mascots. Pick one, install it with the shadcn CLI, and
              the code lives in your project.
            </p>

            <div className="mt-9 flex flex-wrap items-center gap-3">
              <Link
                href="/components"
                className={buttonVariants({ size: "lg", className: "group rounded-full px-7 text-sm font-semibold shadow-[0_10px_30px_-10px_var(--primary)]" })}
              >
                Browse components
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
              <Link
                href="/docs/installation"
                className="inline-flex h-10 items-center rounded-full border border-white/25 px-7 text-sm font-semibold text-white transition-colors hover:bg-white/10 sm:h-11"
              >
                Get started
              </Link>
            </div>

            <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm text-white/75">
              {TRUST.map((t) => (
                <li key={t} className="flex items-center gap-2">
                  <span className="grid size-4 place-items-center rounded-full bg-primary text-primary-foreground">
                    <Check className="size-2.5" strokeWidth={4} />
                  </span>
                  {t}
                </li>
              ))}
            </ul>
          </div>

          {/* Glint on a halo, with floating cards like a product shot. */}
          <div className="relative mx-auto aspect-square w-full max-w-[32rem]">
            <div aria-hidden className="absolute inset-[9%] rounded-full bg-white/[0.06] ring-1 ring-white/10" style={depth(-8)} />
            <div aria-hidden className="absolute inset-[22%] rounded-full bg-primary/20 blur-[70px]" style={depth(-12)} />
            <div className="absolute inset-0 grid place-items-center" style={depth(6)}>
              <GlintBot size={330} wave className="max-w-full drop-shadow-2xl" label="Glint, waving hello" />
            </div>

            <div
              className="absolute right-0 top-[6%] flex items-center gap-3 rounded-2xl bg-white px-3.5 py-2.5 text-neutral-900 shadow-2xl"
              style={depth(18)}
            >
              <span className="flex -space-x-2">
                {[
                  { Icon: Type, bg: "bg-[#b5e61d]" },
                  { Icon: Sparkles, bg: "bg-[#38bdf8]" },
                  { Icon: Layers, bg: "bg-[#f59e0b]" },
                  { Icon: Box, bg: "bg-[#a78bfa]" },
                ].map(({ Icon, bg }, i) => (
                  <span key={i} className={`grid size-7 place-items-center rounded-full ring-2 ring-white ${bg}`}>
                    <Icon className="size-3.5 text-neutral-900" />
                  </span>
                ))}
              </span>
              <span className="leading-tight">
                <span className="block text-sm font-bold">{count}+ components</span>
                <span className="block text-[11px] text-neutral-500">{categories} categories</span>
              </span>
            </div>

            <div
              className="absolute bottom-[8%] left-0 flex items-center gap-3 rounded-2xl bg-white py-2.5 pl-2.5 pr-3 text-neutral-900 shadow-2xl"
              style={depth(-22)}
            >
              <span className="grid size-8 place-items-center rounded-xl bg-[#141a0f] text-[#d9ff6b]">
                <Terminal className="size-4" />
              </span>
              <span className="leading-tight">
                <span className="block text-[11px] text-neutral-500">Installed</span>
                <span className="block font-mono text-xs font-semibold">@glint-ui/frost-tiles</span>
              </span>
              <span className="ml-2 rounded-full bg-[#ecfccb] px-2 py-0.5 text-[10px] font-semibold text-[#3f6212]">Just now</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
