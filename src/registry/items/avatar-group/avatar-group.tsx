"use client";
/* eslint-disable @next/next/no-img-element */

import { useState, type CSSProperties, type ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface AvatarGroupPerson {
  name: string;
  src?: string;
}

export interface AvatarGroupProps {
  people: AvatarGroupPerson[];
  /** Avatars shown before collapsing the rest into a "+N" chip. */
  max?: number;
  /** Avatar diameter in px. */
  size?: number;
  /** Px each avatar tucks under its neighbour at rest. */
  overlap?: number;
  /** Fan the avatars apart while the group is hovered or focused. */
  spread?: boolean;
  className?: string;
}

const initials = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .map((w, i, a) => (i === 0 || i === a.length - 1 ? w[0] : ""))
    .join("")
    .toUpperCase();

function hue(name: string) {
  let h = 0;
  for (const c of name) h = (h * 31 + c.charCodeAt(0)) % 360;
  return h;
}

function Face({ person }: { person: AvatarGroupPerson }) {
  const [failed, setFailed] = useState<string | null>(null);
  const h = hue(person.name);
  return (
    <span
      aria-hidden
      className="grid size-full place-items-center overflow-hidden rounded-full font-semibold"
      style={{
        background: `linear-gradient(135deg, oklch(0.78 0.11 ${h}), oklch(0.62 0.14 ${(h + 40) % 360}))`,
        color: `oklch(0.22 0.05 ${h})`,
        fontSize: "calc(var(--ag-size) * 0.36)",
      }}
    >
      {person.src && failed !== person.src ? (
        <img src={person.src} alt="" draggable={false} onError={() => setFailed(person.src!)} className="size-full object-cover" />
      ) : (
        initials(person.name)
      )}
    </span>
  );
}

function Tip({ children }: { children: ReactNode }) {
  return (
    <span
      aria-hidden
      className={cn(
        "pointer-events-none absolute bottom-full left-1/2 z-20 mb-2 w-max max-w-56 -translate-x-1/2 translate-y-1 scale-90 rounded-md bg-foreground px-2 py-1 text-xs font-medium text-background opacity-0 shadow-lg",
        "transition-[opacity,translate,scale] duration-200 ease-[cubic-bezier(.3,1.4,.5,1)] motion-reduce:transition-none",
        "group-hover/item:translate-y-0 group-hover/item:scale-100 group-hover/item:opacity-100 group-focus-visible/item:translate-y-0 group-focus-visible/item:scale-100 group-focus-visible/item:opacity-100",
      )}
    >
      {children}
    </span>
  );
}

export function AvatarGroup({ people, max = 4, size = 44, overlap = 14, spread = true, className }: AvatarGroupProps) {
  const shown = people.slice(0, max);
  const rest = people.slice(max);
  const item = cn(
    "group/item relative -ml-[var(--ag-overlap)] rounded-full outline-none ring-[3px] ring-background first:ml-0",
    "size-[var(--ag-size)] transition-[margin,translate] duration-300 ease-[cubic-bezier(.3,1.3,.5,1)] motion-reduce:transition-none",
    "hover:z-10 hover:-translate-y-1 focus-visible:z-10 focus-visible:-translate-y-1 focus-visible:ring-ring",
    spread && "group-hover/ag:ml-1 group-hover/ag:first:ml-0 group-focus-within/ag:ml-1 group-focus-within/ag:first:ml-0",
  );

  return (
    <ul
      aria-label={`${people.length} people`}
      className={cn("group/ag flex items-center", className)}
      style={{ "--ag-size": `${size}px`, "--ag-overlap": `${overlap}px` } as CSSProperties}
    >
      {shown.map((p) => (
        <li key={p.name} aria-label={p.name} tabIndex={0} className={item}>
          <Face person={p} />
          <Tip>{p.name}</Tip>
        </li>
      ))}
      {rest.length > 0 && (
        <li
          aria-label={`and ${rest.length} more: ${rest.map((p) => p.name).join(", ")}`}
          tabIndex={0}
          className={cn(item, "grid place-items-center bg-muted font-semibold text-muted-foreground")}
          style={{ fontSize: `calc(var(--ag-size) * 0.32)` }}
        >
          <span aria-hidden>+{rest.length}</span>
          <Tip>
            {rest.slice(0, 4).map((p) => p.name).join(", ")}
            {rest.length > 4 && ` and ${rest.length - 4} more`}
          </Tip>
        </li>
      )}
    </ul>
  );
}
