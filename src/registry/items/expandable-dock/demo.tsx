"use client";

import { Bell, FilePlus2, FolderUp, House, CalendarPlus, Music2, Pause, Search, SkipBack, SkipForward, UserPlus } from "lucide-react";
import { demoImages } from "../../demo-kit";
import { ExpandableDock } from "./expandable-dock";

const [cover, ...avatars] = demoImages(4, 160, 160);
const row =
  "flex w-full items-center gap-3 rounded-xl px-2 py-2 text-left outline-none transition-colors hover:bg-muted focus-visible:bg-muted";

const searchPanel = (
  <div className="w-80">
    <label className="mx-1 flex items-center gap-2 rounded-xl border border-border bg-background/60 px-3 py-2 focus-within:ring-2 focus-within:ring-ring">
      <Search className="size-4 text-muted-foreground" />
      <input placeholder="Search files, people, commands…" className="w-full bg-transparent text-sm !outline-none placeholder:text-muted-foreground" />
      <kbd className="rounded border border-border px-1.5 text-[10px] text-muted-foreground">⌘K</kbd>
    </label>
    <p className="px-3 pb-1 pt-3 text-xs text-muted-foreground">Recent</p>
    {[
      ["Q3 roadmap.pdf", "Updated 2h ago"],
      ["Brand guidelines", "Figma · shared"],
      ["Onboarding checklist", "Notion"],
    ].map(([t, s]) => (
      <button key={t} type="button" className={row}>
        <span className="grid size-8 place-items-center rounded-lg bg-muted text-xs font-semibold text-muted-foreground">{t[0]}</span>
        <span className="flex-1">
          <span className="block text-sm text-foreground">{t}</span>
          <span className="block text-xs text-muted-foreground">{s}</span>
        </span>
      </button>
    ))}
  </div>
);

const createPanel = (
  <div className="grid w-72 grid-cols-2 gap-2">
    {[
      [FilePlus2, "New doc", "from-sky-400 to-indigo-500"],
      [FolderUp, "Upload", "from-emerald-300 to-teal-500"],
      [UserPlus, "Invite", "from-fuchsia-400 to-rose-500"],
      [CalendarPlus, "Event", "from-amber-300 to-orange-500"],
    ].map(([Icon, label, g]) => {
      const I = Icon as typeof FilePlus2;
      return (
        <button
          key={label as string}
          type="button"
          className="flex flex-col items-start gap-6 rounded-2xl bg-muted/60 p-3 text-left outline-none transition-colors hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring"
        >
          <span className={`grid size-8 place-items-center rounded-lg bg-gradient-to-br text-white ${g as string}`}>
            <I className="size-4" />
          </span>
          <span className="text-sm font-medium text-foreground">{label as string}</span>
        </button>
      );
    })}
  </div>
);

const inboxPanel = (
  <div className="w-80">
    {[
      ["Maya Chen", "commented on Pricing v2", "2m"],
      ["Leo Park", "assigned you ENG-218", "18m"],
      ["Ana Ruiz", "shared Brand guidelines", "1h"],
    ].map(([who, what, when], i) => (
      <button key={who} type="button" className={row}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={avatars[i]} alt="" className="size-9 rounded-full object-cover" />
        <span className="flex-1 text-sm text-muted-foreground">
          <span className="font-medium text-foreground">{who}</span> {what}
        </span>
        <span className="text-xs text-muted-foreground">{when}</span>
      </button>
    ))}
  </div>
);

const musicPanel = (
  <div className="flex w-80 items-center gap-3 p-1">
    {/* eslint-disable-next-line @next/next/no-img-element */}
    <img src={cover} alt="" className="size-16 rounded-xl object-cover" />
    <div className="min-w-0 flex-1">
      <p className="truncate text-sm font-medium text-foreground">Signal / Noise</p>
      <p className="truncate text-xs text-muted-foreground">Priya Nair · Live set</p>
      <div className="mt-2 h-1 rounded-full bg-muted">
        <div className="h-full w-2/5 rounded-full bg-foreground" />
      </div>
    </div>
    <div className="flex items-center">
      {[SkipBack, Pause, SkipForward].map((I, i) => (
        <button
          key={i}
          type="button"
          aria-label={["Previous", "Pause", "Next"][i]}
          className="grid size-8 place-items-center rounded-full text-foreground outline-none hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring"
        >
          <I className="size-4" />
        </button>
      ))}
    </div>
  </div>
);

const items = [
  { id: "home", label: "Home", icon: <House /> },
  { id: "search", label: "Search", icon: <Search />, panel: searchPanel },
  { id: "create", label: "Create", icon: <FilePlus2 />, panel: createPanel },
  { id: "inbox", label: "Inbox", icon: <Bell />, panel: inboxPanel },
  { id: "music", label: "Now playing", icon: <Music2 />, panel: musicPanel },
];

export default function Demo(p: Record<string, unknown>) {
  return (
    <>
      <p className="pointer-events-none absolute inset-x-0 top-[38%] text-center text-sm text-muted-foreground">Tap an icon in the dock</p>
      <div className="absolute inset-x-0 bottom-8 flex justify-center">
        <ExpandableDock items={items} {...p} />
      </div>
    </>
  );
}
