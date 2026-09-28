"use client";

import { useEffect, useRef } from "react";
import { demoImages } from "../../demo-kit";
import { NavbarFlow } from "./navbar-flow";

const links = [
  { label: "Product", href: "#product" },
  { label: "Features", href: "#features" },
  { label: "Customers", href: "#customers" },
  { label: "Pricing", href: "#pricing" },
  { label: "Docs", href: "#docs" },
];

const shots = demoImages(6, 640, 420);
const features = [
  ["Instant previews", "Every branch gets a live URL in seconds."],
  ["Edge functions", "Run logic next to your users, everywhere."],
  ["Analytics", "Real-user vitals without a single cookie."],
  ["Rollbacks", "One click back to any deploy, zero downtime."],
  ["Team spaces", "Roles, audit logs and SSO out of the box."],
  ["AI assist", "Explain failed builds in plain language."],
];

const Brand = (
  <a href="#" className="flex items-center gap-2 text-[15px] font-semibold tracking-tight text-foreground">
    <span className="grid size-7 place-items-center rounded-lg bg-gradient-to-br from-lime-300 to-emerald-500 shadow-[0_0_20px_-4px_rgba(163,230,53,.7)]">
      <svg viewBox="0 0 24 24" className="size-4 fill-black/80" aria-hidden>
        <path d="M12 2l2.4 7.6L22 12l-7.6 2.4L12 22l-2.4-7.6L2 12l7.6-2.4z" />
      </svg>
    </span>
    Glint
  </a>
);

const Action = (
  <a
    href="#signup"
    className="rounded-full bg-foreground px-4 py-1.5 text-sm font-medium text-background transition hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
  >
    Get started
  </a>
);

export default function Demo(p: Record<string, unknown>) {
  const scroller = useRef<HTMLDivElement>(null);

  // Gentle scroll on mount so the preview shows the pill forming.
  useEffect(() => {
    const el = scroller.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const t = window.setTimeout(() => el.scrollTo({ top: 260, behavior: "smooth" }), 900);
    return () => window.clearTimeout(t);
  }, []);

  return (
    <div className="h-[26rem] w-full max-w-5xl overflow-hidden rounded-2xl border border-border bg-background shadow-2xl">
      <div ref={scroller} className="relative h-full overflow-y-auto overscroll-contain [scrollbar-width:thin]">
        <NavbarFlow links={links} brand={Brand} action={Action} {...p} scrollContainerRef={scroller} />
        <section className="relative px-8 pb-10 pt-14 text-center">
          <div aria-hidden className="pointer-events-none absolute inset-x-0 -top-24 mx-auto h-72 max-w-xl rounded-full bg-lime-400/20 blur-3xl" />
          <p className="relative mx-auto mb-4 w-fit rounded-full border border-border px-3 py-1 text-xs text-muted-foreground">New · Glint 3.0 is here</p>
          <h1 className="relative mx-auto max-w-2xl text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">Ship the web at the speed of thought.</h1>
          <p className="relative mx-auto mt-4 max-w-md text-muted-foreground">Scroll this window and watch the navigation flow into a floating pill.</p>
        </section>
        <section className="grid gap-4 px-8 pb-10 sm:grid-cols-3">
          {features.map(([t, d], i) => (
            <div key={t} className="overflow-hidden rounded-xl border border-border bg-card">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={shots[i]} alt="" className="h-28 w-full object-cover opacity-80" />
              <div className="p-4">
                <h3 className="font-medium text-foreground">{t}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{d}</p>
              </div>
            </div>
          ))}
        </section>
        <section className="space-y-3 px-8 pb-16">
          {Array.from({ length: 6 }, (_, i) => (
            <div key={i} className="h-3 rounded-full bg-muted" style={{ width: `${92 - ((i * 17) % 40)}%` }} />
          ))}
        </section>
      </div>
    </div>
  );
}
