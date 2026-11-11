"use client";

import { usePathname } from "next/navigation";
import { ViewTransition, type ReactNode } from "react";

/**
 * Soft swap between routes: the old content fades and blurs out, the new one rises in.
 * Keyed by the path, so React runs a view transition on every navigation (navigations are
 * transitions in the App Router). `section` keys by the first path segment only, for the outer
 * wrapper, so moving between pages inside /components doesn't remount the sidebar.
 */
export function PageSwap({ children, by = "page" }: { children: ReactNode; by?: "page" | "section" }) {
  const pathname = usePathname();
  const key = by === "section" ? pathname.split("/")[1] || "home" : pathname;
  return (
    <ViewTransition key={key} enter="page-enter" exit="page-exit" default="none">
      {children}
    </ViewTransition>
  );
}
