"use client";

import type { ReactNode } from "react";
import { RadialSocials } from "./radial-socials";

// Stroke brand glyphs (lucide-style, ISC) since lucide-react no longer ships brand icons.
const glyph = (...children: ReactNode[]) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    {children}
  </svg>
);

const items = [
  { label: "X", href: "https://x.com", color: "#0f1419", icon: glyph(<path key="a" d="M4 4l11.7 16H20L8.3 4z" />, <path key="b" d="M4 20l6.8-7.2M20 4l-6.8 7.2" />) },
  {
    label: "GitHub",
    href: "https://github.com",
    color: "#6e40c9",
    icon: glyph(
      <path key="a" d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.4 5.4 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65S8.93 17.38 9 18v4" />,
      <path key="b" d="M9 18c-4.51 2-5-2-7-2" />,
    ),
  },
  {
    label: "LinkedIn",
    href: "https://linkedin.com",
    color: "#0a66c2",
    icon: glyph(
      <path key="a" d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-4 0v7h-4v-7a6 6 0 0 1 6-6z" />,
      <rect key="b" x="2" y="9" width="4" height="12" />,
      <circle key="c" cx="4" cy="4" r="2" />,
    ),
  },
  {
    label: "Instagram",
    href: "https://instagram.com",
    color: "#e1306c",
    icon: glyph(<rect key="a" x="2" y="2" width="20" height="20" rx="5" />, <circle key="b" cx="12" cy="12" r="4" />, <path key="c" d="M17.5 6.5h.01" />),
  },
  {
    label: "YouTube",
    href: "https://youtube.com",
    color: "#ff0033",
    icon: glyph(
      <path key="a" d="M2.5 17a24 24 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.6 49.6 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24 24 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.6 49.6 0 0 1-16.2 0A2 2 0 0 1 2.5 17" />,
      <path key="b" d="m10 15 5-3-5-3z" />,
    ),
  },
  {
    label: "Dribbble",
    href: "https://dribbble.com",
    color: "#ea4c89",
    icon: glyph(
      <circle key="a" cx="12" cy="12" r="10" />,
      <path key="b" d="M19.13 5.09C15.22 9.14 10 10.44 2.25 10.94M21.75 12.84c-6.62-1.41-12.14 1-16.38 6.32M8.56 2.75c4.37 6 6 9.42 8 17.72" />,
    ),
  },
];

export default function Demo(p: Record<string, unknown>) {
  return (
    <div className="flex flex-col items-center gap-8 pt-32">
      <RadialSocials items={items} defaultOpen {...p} />
      <div className="text-center">
        <p className="text-lg font-medium text-foreground">Share this post</p>
        <p className="text-sm text-muted-foreground">Tap the button to fan out</p>
      </div>
    </div>
  );
}
