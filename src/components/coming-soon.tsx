"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { GITHUB_URL, SITE_NAME } from "@/lib/site";
import { Badge } from "@/registry/items/badge/badge";
import { buttonVariants } from "@/registry/items/button/button";
import { DotGrid } from "@/registry/items/dot-grid/dot-grid";
import { GlintBot } from "@/registry/items/glint-bot/glint-bot";
import { RotatingText } from "@/registry/items/rotating-text/rotating-text";
import { GitHubIcon, Logo } from "./icons";

const LINES = ["Hi! I'm Glint.", "We're polishing the last few pixels.", "Boop me while you wait."];

export function ComingSoon({ count }: { count: number }) {
  const [line, setLine] = useState(0);
  useEffect(() => {
    const t = window.setInterval(() => setLine((l) => (l + 1) % LINES.length), 3200);
    return () => window.clearInterval(t);
  }, []);

  return (
    <main className="dark relative isolate flex min-h-dvh flex-col overflow-hidden bg-[oklch(0.13_0.004_110)] text-foreground">
      <div aria-hidden className="absolute inset-0 -z-10 opacity-60">
        <DotGrid gap={26} dotSize={1.4} baseColor="#3a3f33" activeColor="#b5e61d" proximity={170} />
      </div>
      <div
        aria-hidden
        className="absolute left-1/2 top-1/3 -z-10 size-[42rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/15 blur-[120px]"
      />

      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-6">
        <span className="flex items-center gap-2 font-display text-lg font-bold">
          <Logo className="size-8" /> {SITE_NAME}
        </span>
        <a href={GITHUB_URL} target="_blank" rel="noreferrer" className={buttonVariants({ variant: "ghost", size: "sm", className: "rounded-full" })}>
          <GitHubIcon className="size-4" /> GitHub
        </a>
      </header>

      <section className="mx-auto grid w-full max-w-6xl flex-1 items-center gap-10 px-6 pb-16 lg:grid-cols-[1.1fr_0.9fr]">
        <div>
          <Badge shine>Coming soon</Badge>
          <h1 className="mt-6 font-display text-5xl font-bold leading-[1.02] tracking-tight sm:text-7xl">
            Something&apos;s
            <br />
            <RotatingText words={["glinting.", "moving.", "almost here."]} interval={2400} className="pb-[0.12em] leading-[1.1] text-primary" />
          </h1>
          <p className="mt-6 max-w-lg text-lg leading-relaxed text-muted-foreground">
            {count} animated React components: text effects, cursors, WebGL backgrounds, UI and mascots. Copy one,
            paste it, make it yours. Launching soon.
          </p>
          <div className="mt-9 flex flex-wrap gap-3">
            <a
              href={GITHUB_URL}
              target="_blank"
              rel="noreferrer"
              className={buttonVariants({ size: "lg", className: "rounded-full px-7 text-sm font-semibold shadow-[0_8px_30px_-8px_var(--primary)]" })}
            >
              <GitHubIcon className="size-4" /> Star on GitHub to get notified
            </a>
          </div>
        </div>

        <div className="relative mx-auto flex flex-col items-center">
          <AnimatePresence mode="wait">
            <motion.p
              key={line}
              role="status"
              initial={{ opacity: 0, y: 8, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ type: "spring", stiffness: 380, damping: 26 }}
              className="relative mb-2 rounded-2xl border bg-card px-4 py-2.5 text-sm shadow-xl"
            >
              {LINES[line]}
              <span aria-hidden className="absolute -bottom-[7px] left-1/2 size-3 -translate-x-1/2 rotate-45 border-r border-b bg-card" />
            </motion.p>
          </AnimatePresence>
          <GlintBot size={360} wave className="max-w-[80vw]" label="Glint, waving hello" />
        </div>
      </section>

      <footer className="px-6 pb-6 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} {SITE_NAME}
      </footer>
    </main>
  );
}
