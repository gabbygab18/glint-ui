"use client";

import { ChevronDown, Package } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "./collapsible";

const items = [
  { name: "Linen overshirt", meta: "Sand · M", price: "$89.00" },
  { name: "Canvas tote", meta: "Natural", price: "$32.00" },
  { name: "Merino beanie", meta: "Charcoal", price: "$38.00" },
  { name: "Wool socks (2 pack)", meta: "Oat · 39-42", price: "$25.00" },
];

const Row = ({ item }: { item: (typeof items)[number] }) => (
  <li className="flex items-center gap-3 py-2.5">
    <span className="grid size-9 place-items-center rounded-lg bg-muted text-muted-foreground">
      <Package className="size-4" aria-hidden />
    </span>
    <div className="min-w-0 flex-1">
      <p className="truncate text-sm font-medium text-foreground">{item.name}</p>
      <p className="text-xs text-muted-foreground">{item.meta}</p>
    </div>
    <span className="text-sm tabular-nums text-foreground">{item.price}</span>
  </li>
);

export default function Demo(p: Record<string, unknown>) {
  return (
    <Collapsible key={String(p.defaultOpen)} {...p} className="w-full max-w-sm rounded-2xl border border-border bg-card p-5 shadow-xl">
      <div className="mb-2 flex items-baseline justify-between">
        <p className="font-semibold text-foreground">Order #3102</p>
        <p className="text-sm text-muted-foreground">4 items · $184.00</p>
      </div>
      <ul className="divide-y divide-border">
        <Row item={items[0]} />
      </ul>
      <CollapsibleContent>
        <ul className="divide-y divide-border border-t border-border">
          {items.slice(1).map((it) => (
            <Row key={it.name} item={it} />
          ))}
        </ul>
      </CollapsibleContent>
      <CollapsibleTrigger className="group mt-2 flex h-9 w-full items-center justify-center gap-1.5 rounded-lg text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
        <span className="group-data-[state=open]:hidden">Show 3 more items</span>
        <span className="hidden group-data-[state=open]:inline">Show less</span>
        <ChevronDown
          className="size-4 transition-transform duration-300 group-data-[state=open]:rotate-180 motion-reduce:transition-none"
          aria-hidden
        />
      </CollapsibleTrigger>
    </Collapsible>
  );
}
