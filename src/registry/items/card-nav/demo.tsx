"use client";

import { CardNav } from "./card-nav";

const items = [
  {
    label: "About",
    bgColor: "#1c1917",
    textColor: "#fafaf9",
    links: [
      { label: "Company", href: "#" },
      { label: "Careers", href: "#" },
    ],
  },
  {
    label: "Projects",
    bgColor: "#3b1d7a",
    textColor: "#f5f3ff",
    links: [
      { label: "Featured", href: "#" },
      { label: "Case studies", href: "#" },
    ],
  },
  {
    label: "Contact",
    bgColor: "#bef264",
    textColor: "#1a2e05",
    links: [
      { label: "Email", href: "#" },
      { label: "Twitter", href: "#" },
      { label: "LinkedIn", href: "#" },
    ],
  },
];

export default function Demo(p: Record<string, unknown>) {
  return (
    <div className="absolute inset-x-0 top-8 flex justify-center px-4">
      <div className="w-full max-w-3xl">
        <CardNav
          items={items}
          logo={
            <span>
              nova<span className="text-primary">*</span>
            </span>
          }
          {...p}
        />
      </div>
    </div>
  );
}
