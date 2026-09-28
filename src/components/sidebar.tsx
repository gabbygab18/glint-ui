"use client";

import { BookOpen, Box, ChevronDown, Layers, LayoutGrid, MousePointerClick, Smile, Sparkles, Type, Zap } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { CATEGORIES, registry } from "@/registry";
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
        className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm transition-colors ${
          current ? "bg-foreground font-medium text-background" : "text-muted-foreground hover:bg-muted hover:text-foreground"
        }`}
      >
        <span className="truncate">{label}</span>
        {isNew && (
          <Badge size="sm" variant={current ? "secondary" : "default"} className="ml-auto shrink-0">
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
  children: React.ReactNode;
}) {
  return (
    <details open={open} className="group/section">
      <summary className="flex cursor-pointer list-none items-center gap-2.5 rounded-lg px-2 py-2 font-display text-[15px] font-semibold hover:bg-muted [&::-webkit-details-marker]:hidden">
        <Icon className="size-4 text-muted-foreground" />
        {label}
        <ChevronDown className="ml-auto size-4 text-muted-foreground transition-transform group-open/section:rotate-180" />
      </summary>
      <ul className="mb-3 ml-[1.1rem] mt-1 space-y-0.5 border-l pl-3">{children}</ul>
    </details>
  );
}

export function SidebarNav() {
  const pathname = usePathname();
  const currentCategory = registry.find((e) => pathname === `/components/${e.slug}`)?.category;

  return (
    <nav aria-label="Documentation" className="space-y-1">
      <Section label="Getting Started" Icon={BookOpen} open>
        {docs.map((d) => (
          <Item key={d.href} {...d} />
        ))}
      </Section>
      {CATEGORIES.map((c) => {
        const items = registry.filter((e) => e.category === c.id);
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

export function Sidebar() {
  return (
    <>
      <aside className="sticky top-16 hidden h-[calc(100dvh-4rem)] w-64 shrink-0 lg:block">
        <ScrollArea className="h-full" viewportClassName="overscroll-contain py-8 pr-4">
          <SidebarNav />
        </ScrollArea>
      </aside>
      <details className="mt-6 rounded-2xl border bg-card lg:hidden">
        <summary className="cursor-pointer px-4 py-3 text-sm text-muted-foreground">Browse components</summary>
        <ScrollArea className="max-h-[60vh] border-t" viewportClassName="max-h-[60vh] p-3">
          <SidebarNav />
        </ScrollArea>
      </details>
    </>
  );
}
