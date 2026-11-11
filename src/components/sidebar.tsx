"use client";

import { BookOpen, Box, ChevronDown, Layers, LayoutGrid, MousePointerClick, Smile, Sparkles, Type, Zap } from "@/components/site-icons";
import { LayoutGroup, motion } from "motion/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, type ReactNode } from "react";
import { CATEGORIES, type NavEntry } from "@/registry/types";
import { Badge } from "@/registry/items/badge/badge";
import { ScrollArea } from "@/registry/items/scroll-area/scroll-area";

const icons = {
  type: Type,
  sparkles: Sparkles,
  layers: Layers,
  layout: LayoutGrid,
  pointer: MousePointerClick,
  zap: Zap,
  box: Box,
  smile: Smile,
};

const docs = [
  { href: "/docs", label: "Introduction" },
  { href: "/docs/installation", label: "Installation" },
  { href: "/components", label: "All components" },
];

function Item({ href, label, isNew }: { href: string; label: string; isNew?: boolean }) {
  const pathname = usePathname();
  const current = pathname === href;
  return (
    <li>
      <Link
        href={href}
        aria-current={current ? "page" : undefined}
        className={`relative flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm transition-colors duration-300 ${
          current ? "font-medium text-white dark:text-[#141a0f]" : "text-muted-foreground hover:bg-muted hover:text-foreground"
        }`}
      >
        {/* One highlight that glides to the current page instead of jumping. */}
        {current && (
          <motion.span
            layoutId="sidebar-active"
            className="btn-ink absolute inset-0 rounded-lg dark:[background:#d9ff6b]"
            transition={{ type: "spring", bounce: 0.18, duration: 0.45 }}
          />
        )}
        <span className="relative truncate">{label}</span>
        {isNew && (
          <Badge size="sm" variant={current ? "secondary" : "default"} className="relative ml-auto shrink-0">
            New
          </Badge>
        )}
      </Link>
    </li>
  );
}

function Section({
  label,
  Icon,
  open,
  children,
}: {
  label: string;
  Icon: typeof Type;
  open: boolean;
  children: ReactNode;
}) {
  // Links render only once a section has been opened: closed categories cost no HTML.
  const [seen, setSeen] = useState(open);
  return (
    <details open={open} onToggle={(e) => e.currentTarget.open && setSeen(true)} className="group/section">
      <summary className="flex cursor-pointer list-none items-center gap-2.5 rounded-lg px-2 py-2 font-display text-[15px] font-semibold hover:bg-muted [&::-webkit-details-marker]:hidden">
        <Icon className="size-4 text-muted-foreground" />
        {label}
        <ChevronDown className="ml-auto size-4 text-muted-foreground transition-transform group-open/section:rotate-180" />
      </summary>
      {(seen || open) && <ul className="mb-3 ml-[1.1rem] mt-1 space-y-0.5 border-l pl-3">{children}</ul>}
    </details>
  );
}

export function SidebarNav({ entries }: { entries: NavEntry[] }) {
  const pathname = usePathname();
  const currentCategory = entries.find((e) => pathname === `/components/${e.slug}`)?.category;

  return (
    <nav aria-label="Documentation" className="space-y-1">
      <Section label="Getting Started" Icon={BookOpen} open>
        {docs.map((d) => (
          <Item key={d.href} {...d} />
        ))}
      </Section>
      {CATEGORIES.map((c) => {
        const items = entries.filter((e) => e.category === c.id);
        if (!items.length) return null;
        return (
          <Section key={c.id} label={c.label} Icon={icons[c.icon]} open={c.id === currentCategory}>
            {items.map((e) => (
              <Item key={e.slug} href={`/components/${e.slug}`} label={e.name} isNew={e.isNew} />
            ))}
          </Section>
        );
      })}
    </nav>
  );
}

export function Sidebar({ entries }: { entries: NavEntry[] }) {
  // The phone copy renders its links only after it is first opened.
  const [mobile, setMobile] = useState(false);
  return (
    <>
      <aside className="sticky top-20 hidden h-[calc(100dvh-5rem)] w-64 shrink-0 lg:block">
        <ScrollArea className="h-full" viewportClassName="overscroll-contain py-8 pr-4">
          {/* Each copy of the nav gets its own scope, so its highlight never tries to slide in from the other. */}
          <LayoutGroup id="sidebar-desktop">
            <SidebarNav entries={entries} />
          </LayoutGroup>
        </ScrollArea>
      </aside>
      <details className="mt-6 rounded-2xl border bg-card lg:hidden" onToggle={(e) => e.currentTarget.open && setMobile(true)}>
        <summary className="cursor-pointer px-4 py-3 text-sm text-muted-foreground">Browse components</summary>
        <ScrollArea className="max-h-[60vh] border-t" viewportClassName="max-h-[60vh] p-3">
          <LayoutGroup id="sidebar-mobile">{mobile && <SidebarNav entries={entries} />}</LayoutGroup>
        </ScrollArea>
      </details>
    </>
  );
}
