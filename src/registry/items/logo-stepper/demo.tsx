"use client";

import type { ReactNode } from "react";
import { LogoStepper, type LogoStep } from "./logo-stepper";

// Fictional brands with simple geometric marks.
const Mark = ({ children, name }: { children: ReactNode; name: string }) => (
  <span className="flex items-center gap-2">
    <svg viewBox="0 0 24 24" className="size-6" fill="currentColor" aria-hidden>
      {children}
    </svg>
    <span className="text-lg font-semibold tracking-tight">{name}</span>
  </span>
);

const Stat = ({ n, text }: { n: string; text: string }) => (
  <>
    <span className="font-semibold text-foreground">{n}</span> {text}
  </>
);

const logos: LogoStep[] = [
  {
    name: "Northwind",
    logo: (
      <Mark name="Northwind">
        <path d="M12 2 22 20H2z" />
      </Mark>
    ),
    caption: <Stat n="68% faster" text="builds after Northwind moved their monorepo over." />,
  },
  {
    name: "Lumen",
    logo: (
      <Mark name="Lumen">
        <circle cx="12" cy="12" r="5" />
        <path d="M12 1v4M12 19v4M1 12h4M19 12h4" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
      </Mark>
    ),
    caption: <Stat n="3.1M" text="monthly visitors served by Lumen with zero downtime." />,
  },
  {
    name: "Arcflow",
    logo: (
      <Mark name="Arcflow">
        <path d="M3 20a9 9 0 0 1 18 0h-4a5 5 0 0 0-10 0z" />
      </Mark>
    ),
    caption: <Stat n="12 engineers" text="at Arcflow now ship what used to take a team of 40." />,
  },
  {
    name: "Kiteform",
    logo: (
      <Mark name="Kiteform">
        <path d="M12 2 20 12 12 22 4 12z" />
      </Mark>
    ),
    caption: <Stat n="+24% conversion" text="on Kiteform's checkout after the redesign." />,
  },
  {
    name: "Polaris",
    logo: (
      <Mark name="Polaris">
        <path d="M12 2l2.6 7.4L22 12l-7.4 2.6L12 22l-2.6-7.4L2 12l7.4-2.6z" />
      </Mark>
    ),
    caption: <Stat n="9 regions" text="live in a single afternoon for the Polaris platform team." />,
  },
];

export default function Demo(p: Record<string, unknown>) {
  return (
    <div className="flex w-full max-w-4xl flex-col items-center">
      <p className="mb-8 text-xs font-medium uppercase tracking-[0.25em] text-muted-foreground">Trusted by fast-moving teams</p>
      <LogoStepper logos={logos} {...p} />
    </div>
  );
}
