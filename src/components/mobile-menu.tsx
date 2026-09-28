"use client";

import { Menu, Search as SearchIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { GITHUB_URL, SITE_NAME } from "@/lib/site";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/registry/items/sheet/sheet";
import { GitHubIcon, Logo } from "./icons";
import { ThemeSwitch } from "./theme-switch";

const links = [
  { href: "/components", label: "Components" },
  { href: "/docs", label: "Introduction" },
  { href: "/docs/installation", label: "Installation" },
  { href: "/favorites", label: "Favorites" },
];

/** Phone-only navigation: a hamburger that opens a side sheet. */
export function MobileMenu() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  const openSearch = () => {
    setOpen(false);
    // The search dialog listens for Ctrl/Cmd+K; reuse it instead of nesting dialogs.
    window.setTimeout(() => window.dispatchEvent(new KeyboardEvent("keydown", { key: "k", ctrlKey: true })), 150);
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger aria-label="Open menu" className="size-9 rounded-full p-0 sm:hidden">
        <Menu className="size-5" />
      </SheetTrigger>
      <SheetContent side="right" className="flex flex-col gap-6">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2 font-display">
            <Logo className="size-7" /> {SITE_NAME}
          </SheetTitle>
        </SheetHeader>

        <button
          type="button"
          onClick={openSearch}
          className="flex h-11 items-center gap-2 rounded-xl border bg-background px-3 text-sm text-muted-foreground"
        >
          <SearchIcon className="size-4" /> Search components
        </button>

        <nav aria-label="Mobile" className="flex flex-col gap-1">
          {links.map((l) => {
            const active = pathname === l.href;
            return (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                aria-current={active ? "page" : undefined}
                className={`rounded-xl px-3 py-2.5 font-display text-lg font-semibold ${
                  active ? "bg-foreground text-background" : "hover:bg-muted"
                }`}
              >
                {l.label}
              </Link>
            );
          })}
          <a href={GITHUB_URL} target="_blank" rel="noreferrer" className="flex items-center gap-2 rounded-xl px-3 py-2.5 font-display text-lg font-semibold hover:bg-muted">
            <GitHubIcon className="size-5" /> GitHub
          </a>
        </nav>

        <div className="mt-auto flex items-center justify-between border-t pt-4 text-sm text-muted-foreground">
          Theme
          <ThemeSwitch />
        </div>
      </SheetContent>
    </Sheet>
  );
}
