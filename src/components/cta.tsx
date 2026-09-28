"use client";

import { ArrowRight } from "lucide-react";
import Link from "next/link";
import type { PointerEvent } from "react";
import { GITHUB_URL } from "@/lib/site";
import { GitHubIcon } from "./icons";

export function Cta() {
  const onMove = (e: PointerEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty("--cx", `${((e.clientX - r.left) / r.width) * 100}%`);
    e.currentTarget.style.setProperty("--cy", `${((e.clientY - r.top) / r.height) * 100}%`);
  };

  return (
    <section className="mx-auto w-full max-w-[90rem] px-4 py-20 sm:px-6">
      <div
        onPointerMove={onMove}
        className="grain relative isolate overflow-hidden rounded-[2.5rem] px-6 py-20 text-center sm:py-24"
        style={{
          background:
            "radial-gradient(600px circle at var(--cx, 30%) var(--cy, 20%), oklch(0.95 0.17 125), transparent 60%), radial-gradient(700px circle at 85% 90%, oklch(0.78 0.14 195), transparent 60%), linear-gradient(135deg, oklch(0.86 0.2 128), oklch(0.72 0.17 160))",
        }}
      >
        <h2 className="mx-auto max-w-3xl text-balance font-display text-4xl font-bold tracking-tight text-[oklch(0.2_0.04_130)] sm:text-6xl">
          Stop shipping static interfaces.
        </h2>
        <p className="mx-auto mt-5 max-w-xl text-balance text-lg text-[oklch(0.25_0.04_130)]/80">
          Copy a component, paste it in, make it yours. Free, open source, no package to keep updated.
        </p>
        <div className="mt-9 flex flex-wrap justify-center gap-3">
          <Link
            href="/components"
            className="group inline-flex h-12 items-center gap-2 rounded-full bg-[oklch(0.17_0.01_130)] px-7 text-sm font-semibold text-white shadow-2xl transition-transform active:scale-[0.97]"
          >
            <span className="size-2 rounded-full bg-[oklch(0.91_0.2_125)]" />
            Browse components
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
          <a
            href={GITHUB_URL}
            target="_blank"
            rel="noreferrer"
            className="inline-flex h-12 items-center gap-2 rounded-full border border-black/15 bg-white/40 px-7 text-sm font-semibold text-[oklch(0.2_0.04_130)] backdrop-blur hover:bg-white/60"
          >
            <GitHubIcon className="size-4" /> Star on GitHub
          </a>
        </div>
      </div>
    </section>
  );
}
