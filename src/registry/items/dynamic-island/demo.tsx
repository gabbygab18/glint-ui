"use client";

import { useState } from "react";
import { Music2, Pause, Play, SkipBack, SkipForward, Volume2 } from "lucide-react";
import { DynamicIsland, type DynamicIslandState } from "./dynamic-island";

const STATES: DynamicIslandState[] = ["idle", "compact", "expanded", "alert"];

export default function Demo(p: Record<string, unknown>) {
  const [state, setState] = useState<DynamicIslandState>("compact");
  const [playing, setPlaying] = useState(true);

  return (
    <div className="flex w-full max-w-md flex-col items-center gap-6 px-4">
      <div className="flex h-56 w-full items-start justify-center">
        <DynamicIsland
          pulse
          {...p}
          state={state}
          onStateChange={setState}
          label="Now playing"
          icon={<Music2 className="size-3.5" />}
          title={state === "alert" ? "Battery low: 5%" : "Solaris · Citrus Beat"}
          trailing={
            <div className="flex h-3 items-end gap-0.5">
              <span className="h-full w-0.5 animate-pulse rounded-full bg-current" />
              <span className="h-2/3 w-0.5 animate-pulse rounded-full bg-current/80 delay-75" />
              <span className="h-4/5 w-0.5 animate-pulse rounded-full bg-current/90 delay-150" />
            </div>
          }
          expandedContent={
            <div className="flex size-full flex-col justify-between">
              <div className="flex items-center gap-3">
                <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-current/15 shadow-xs ring-1 ring-current/20">
                  <Music2 className="size-6" />
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="truncate text-xs font-semibold">Solaris (Acoustic Version)</h4>
                  <p className="truncate text-[11px] text-current/70">Calamansi Sound Collective</p>
                </div>
                <Volume2 className="size-4 text-current/60" />
              </div>
              <div className="space-y-1">
                <div className="h-1 w-full overflow-hidden rounded-full bg-current/15">
                  <div className="h-full w-2/5 rounded-full bg-current" />
                </div>
                <div className="flex justify-between text-[10px] text-current/60">
                  <span>1:24</span>
                  <span>-2:48</span>
                </div>
              </div>
              <div className="flex items-center justify-center gap-6">
                <button type="button" aria-label="Previous" onClick={(e) => e.stopPropagation()} className="text-current/70 transition hover:text-current">
                  <SkipBack className="size-4 fill-current" />
                </button>
                <button
                  type="button"
                  aria-label={playing ? "Pause" : "Play"}
                  onClick={(e) => {
                    e.stopPropagation();
                    setPlaying((v) => !v);
                  }}
                  className="flex size-8 items-center justify-center rounded-full bg-white text-black shadow-xs transition hover:scale-105"
                >
                  {playing ? <Pause className="size-4 fill-current" /> : <Play className="ml-0.5 size-4 fill-current" />}
                </button>
                <button type="button" aria-label="Next" onClick={(e) => e.stopPropagation()} className="text-current/70 transition hover:text-current">
                  <SkipForward className="size-4 fill-current" />
                </button>
              </div>
            </div>
          }
        />
      </div>

      <div className="flex rounded-lg border border-border bg-muted/30 p-0.5 text-xs">
        {STATES.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setState(s)}
            className={`rounded-md px-3 py-1 font-medium capitalize transition ${
              state === s ? "bg-card text-foreground shadow-xs" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {s}
          </button>
        ))}
      </div>
      <p className="text-[11px] tracking-wide text-muted-foreground uppercase">Tap the island to expand</p>
    </div>
  );
}
