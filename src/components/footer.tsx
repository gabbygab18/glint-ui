import Link from "next/link";
import { GITHUB_URL, SITE_NAME, SITE_TAGLINE } from "@/lib/site";
import { Logo } from "./icons";
import { ThemeSwitch } from "./theme-switch";

export function Footer() {
  return (
    <footer className="border-t">
      <div className="mx-auto grid max-w-[90rem] gap-10 px-6 py-14 sm:grid-cols-[2fr_1fr_1fr]">
        <div>
          <p className="flex items-center gap-2 font-display text-lg font-bold">
            <Logo className="size-6" /> {SITE_NAME}
          </p>
          <p className="mt-2 max-w-sm text-sm text-muted-foreground">{SITE_TAGLINE}</p>
          <div className="mt-4 w-fit">
            <ThemeSwitch />
          </div>
          <p className="mt-6 max-w-md text-xs text-muted-foreground">
            Effect ideas inspired by React Bits, ScrollX UI and Calamansi UI. All code here is original, except
            components marked with a credit, which keep their original license.
          </p>
        </div>
        <div className="space-y-2 text-sm">
          <p className="font-medium">Library</p>
          <Link href="/components" className="block text-muted-foreground hover:text-foreground">
            Components
          </Link>
          <Link href="/docs/installation" className="block text-muted-foreground hover:text-foreground">
            Installation
          </Link>
          <Link href="/favorites" className="block text-muted-foreground hover:text-foreground">
            Favorites
          </Link>
        </div>
        <div className="space-y-2 text-sm">
          <p className="font-medium">Project</p>
          <a href={GITHUB_URL} className="block text-muted-foreground hover:text-foreground">
            GitHub
          </a>
          <Link href="/docs" className="block text-muted-foreground hover:text-foreground">
            Introduction
          </Link>
        </div>
      </div>
    </footer>
  );
}
