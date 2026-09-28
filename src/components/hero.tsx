"use client";

import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { useRef, type CSSProperties, type PointerEvent } from "react";
import { CountUp } from "@/registry/items/count-up/count-up";
import { DecryptedText } from "@/registry/items/decrypted-text/decrypted-text";
import { DotGrid } from "@/registry/items/dot-grid/dot-grid";
import { GlintBot } from "@/registry/items/glint-bot/glint-bot";
import { Magnet } from "@/registry/items/magnet/magnet";
import { RotatingText } from "@/registry/items/rotating-text/rotating-text";
import { CopyButton } from "./copy-button";
import { buttonVariants } from "@/registry/items/button/button";

// Floating cards drift against the pointer at different depths.
const depth = (px: number): CSSProperties => ({
  transform: `translate3d(calc(var(--px, 0) * ${px}px), calc(var(--py, 0) * ${px}px), 0)`,
  transition: "transform 0.4s cubic-bezier(.2,.7,.2,1)",
});

export function Hero({ count, installCmd }: { count: number; installCmd: string }) {
  const ref = useRef<HTMLElement>(null);

  const onMove = (e: PointerEvent<HTMLElement>) => {
    const el = ref.current!;
    const r = el.getBoundingClientRect();
    el.style.setProperty("--mx", `${e.clientX - r.left}px`);
    el.style.setProperty("--my", `${e.clientY - r.top}px`);
    el.style.setProperty("--px", `${((e.clientX - r.left) / r.width - 0.5) * 2}`);
    el.style.setProperty("--py", `${((e.clientY - r.top) / r.height - 0.5) * 2}`);
  };

  return (
    <section ref={ref} onPointerMove={onMove} className="relative isolate overflow-hidden border-b">
      {/* Interactive backdrop: dot field + a spotlight that follows the pointer. */}
      <div aria-hidden className="absolute inset-0 -z-10 opacity-70">
        <DotGrid gap={26} dotSize={1.4} baseColor="#8a8f7e" activeColor="#b5e61d" proximity={160} />
      </div>
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(520px circle at var(--mx, 70%) var(--my, 30%), color-mix(in oklch, var(--primary) 16%, transparent), transparent 70%)",
        }}
      />
      <div aria-hidden className="absolute inset-x-0 bottom-0 -z-10 h-40 bg-gradient-to-b from-transparent to-background" />

      <div className="mx-auto grid max-w-[90rem] items-center gap-12 px-6 pb-20 pt-16 sm:pt-24 lg:grid-cols-[1.15fr_0.85fr] lg:pb-28">
        <div className="min-w-0">
          <Link
            href="/components"
            className="group inline-flex items-center gap-2 rounded-full border bg-card/70 py-1 pl-1 pr-3 text-xs backdrop-blur"
          >
            <span className="rounded-full bg-primary px-2 py-0.5 font-semibold text-primary-foreground">New</span>
            <span className="text-muted-foreground group-hover:text-foreground">Text, cursor and WebGL effects</span>
            <ArrowRight className="size-3 transition-transform group-hover:translate-x-0.5" />
          </Link>

          <h1 className="mt-7 font-display text-5xl font-bold leading-[1.02] tracking-tight sm:text-7xl">
            Interfaces that
            <br />
            <RotatingText words={["move.", "glow.", "react.", "feel alive."]} interval={2200} className="pb-[0.12em] pt-[0.04em] leading-[1.1] text-primary" />
          </h1>

          <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground">
            {count} animated React components: text effects, cursors, WebGL backgrounds, UI and mascots. Copy one,
            paste it, make it yours.
          </p>

          <div className="mt-9 flex flex-wrap items-center gap-3">
            <Magnet padding={40} strength={6}>
              <Link
                href="/components"
                className={buttonVariants({ size: "lg", className: "group rounded-full px-7 text-sm font-semibold shadow-[0_8px_30px_-8px_var(--primary)]" })}
              >
                Browse components
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </Magnet>
            <Link
              href="/docs/installation"
              className={buttonVariants({ variant: "outline", size: "lg", className: "rounded-full bg-card/60 px-7 text-sm backdrop-blur" })}
            >
              Get started
            </Link>
          </div>

          <div className="mt-8 flex max-w-xl items-center gap-3 rounded-2xl border bg-card/70 py-2 pl-4 pr-2 font-mono text-[13px] backdrop-blur">
            <span className="text-primary">$</span>
            <span className="min-w-0 truncate text-muted-foreground">{installCmd}</span>
            <CopyButton value={installCmd} className="ml-auto shrink-0" />
          </div>

          <dl className="mt-10 flex gap-10">
            {[
              { value: count, label: "components" },
              { value: 8, label: "categories" },
              { value: 0, label: "lock-in" },
            ].map((s) => (
              <div key={s.label}>
                <dt className="sr-only">{s.label}</dt>
                <dd className="font-display text-3xl font-bold">
                  <CountUp to={s.value} duration={1600} />
                </dd>
                <dd className="text-sm text-muted-foreground">{s.label}</dd>
              </div>
            ))}
          </dl>
        </div>

        {/* Live stage: every piece here is a real component from the registry. */}
        <div className="relative mx-auto aspect-square w-full max-w-[34rem]">
          <div
            aria-hidden
            className="absolute inset-[12%] rounded-full bg-primary/25 blur-[80px]"
            style={depth(-10)}
          />
          <div className="absolute inset-0 grid place-items-center" style={depth(8)}>
            <GlintBot size={340} className="max-w-full drop-shadow-2xl" />
          </div>

          <div className="absolute left-0 top-[8%] rounded-2xl border bg-card/80 px-4 py-3 shadow-xl backdrop-blur" style={depth(-22)}>
            <p className="text-[11px] text-muted-foreground">Decrypted Text</p>
            <DecryptedText text="hover to decrypt" trigger="hover" className="font-mono text-sm text-primary" />
          </div>

          <div className="absolute bottom-[10%] left-[2%] rounded-2xl border bg-card/80 px-4 py-3 shadow-xl backdrop-blur" style={depth(-30)}>
            <p className="text-[11px] text-muted-foreground">Count Up</p>
            <p className="font-display text-2xl font-bold">
              +<CountUp to={count} duration={2400} />
            </p>
          </div>

          <div className="absolute right-0 top-[20%] rounded-2xl border bg-card/80 p-3 shadow-xl backdrop-blur" style={depth(26)}>
            <p className="mb-2 text-[11px] text-muted-foreground">Magnet</p>
            <Magnet padding={50} strength={2.5}>
              <span className="block rounded-full bg-foreground px-4 py-2 text-xs font-medium text-background">Pull me</span>
            </Magnet>
          </div>

          <p className="absolute inset-x-0 bottom-0 text-center text-xs text-muted-foreground">
            Boop it · drag side to side to pet · poke it five times
          </p>
        </div>
      </div>
    </section>
  );
}
