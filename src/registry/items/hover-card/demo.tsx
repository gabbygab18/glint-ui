"use client";

import { CalendarDays, MapPin } from "lucide-react";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "./hover-card";

export default function Demo(p: Record<string, unknown>) {
  const { openDelay, closeDelay, ...content } = p;
  return (
    // Opens by default so the preview shows it; hover or focus the link to replay.
    <div className="flex h-96 w-full items-start justify-center px-6 pt-16">
      {/* A <div>, not a <p>: the card renders next to its trigger in the DOM (top layer) and contains block elements. */}
      <div className="max-w-md text-center text-base leading-relaxed text-muted-foreground">
        Design tokens were drafted by{" "}
        <HoverCard defaultOpen openDelay={openDelay as number} closeDelay={closeDelay as number}>
          <HoverCardTrigger href="#" onClick={(e) => e.preventDefault()}>
            @mira
          </HoverCardTrigger>
          <HoverCardContent {...content} className="w-80">
            <div className="flex gap-3.5 text-left">
              <span className="size-12 shrink-0 rounded-full bg-linear-to-br from-violet-300 via-fuchsia-400 to-orange-300 ring-2 ring-popover" />
              <div className="grid gap-1">
                <p className="font-semibold text-foreground">
                  Mira Castell <span className="font-normal text-muted-foreground">@mira</span>
                </p>
                <p className="text-sm text-muted-foreground">Design systems at Acme. Tokens, type scales and too many color spaces.</p>
                <div className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="size-3.5" /> Lisbon
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <CalendarDays className="size-3.5" /> Joined March 2021
                  </span>
                </div>
                <p className="mt-1.5 text-xs text-muted-foreground">
                  <span className="font-semibold text-foreground">1,284</span> following{" "}
                  <span className="ml-2 font-semibold text-foreground">18.6k</span> followers
                </p>
              </div>
            </div>
          </HoverCardContent>
        </HoverCard>{" "}
        and reviewed by the whole platform team before the 2.0 release.
      </div>
    </div>
  );
}
