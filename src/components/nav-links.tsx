"use client";

import { motion } from "motion/react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/components", label: "Components" },
  { href: "/docs", label: "Docs" },
  { href: "/favorites", label: "Favorites", hideOnMobile: true },
];

export function NavLinks() {
  const pathname = usePathname();
  return (
    <nav aria-label="Main" className="hidden items-center gap-1 text-sm sm:flex">
      {links.map((l) => {
        const active = pathname.startsWith(l.href);
        return (
          <Link
            key={l.href}
            href={l.href}
            aria-current={active ? "page" : undefined}
            className={`relative rounded-full px-3 py-1.5 transition-colors duration-300 ${l.hideOnMobile ? "hidden sm:block" : ""} ${
              active ? "font-medium text-foreground" : "text-muted-foreground hover:bg-foreground/5 hover:text-foreground"
            }`}
          >
            {active && (
              <motion.span
                layoutId="nav-active"
                className="absolute inset-0 rounded-full bg-foreground/10"
                transition={{ type: "spring", bounce: 0.18, duration: 0.45 }}
              />
            )}
            <span className="relative">{l.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
