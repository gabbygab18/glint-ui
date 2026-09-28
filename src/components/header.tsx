"use client";

import Link from "next/link";
import { GITHUB_URL, SITE_NAME } from "@/lib/site";
import { AuthButton } from "./auth-button";
import { GitHubIcon, Logo } from "./icons";
import { MobileMenu } from "./mobile-menu";
import { NavLinks } from "./nav-links";
import { Search } from "./search";
import { ThemeSwitch } from "./theme-switch";
import { buttonVariants } from "@/registry/items/button/button";
import { Tooltip } from "@/registry/items/tooltip/tooltip";

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b bg-background/75 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-[90rem] items-center gap-6 px-4 sm:px-6">
        <Link
          href="/"
          aria-label={`${SITE_NAME} home`}
          className="flex items-center gap-2 font-display text-lg font-bold tracking-tight"
        >
          <Logo className="size-8 drop-shadow-[0_2px_6px_rgba(181,230,29,0.35)]" />
          <span className="hidden min-[420px]:inline">{SITE_NAME}</span>
        </Link>
        <NavLinks />
        <div className="ml-auto flex items-center gap-2">
          <Search />
          <Tooltip content="GitHub" side="bottom">
            <a
              href={GITHUB_URL}
              target="_blank"
              rel="noreferrer"
              aria-label="GitHub"
              className={buttonVariants({ variant: "ghost", size: "icon", className: "hidden rounded-full text-muted-foreground sm:inline-flex" })}
            >
              <GitHubIcon className="size-5" />
            </a>
          </Tooltip>
          <div className="hidden md:block">
            <ThemeSwitch />
          </div>
          <AuthButton />
          <MobileMenu />
        </div>
      </div>
    </header>
  );
}
