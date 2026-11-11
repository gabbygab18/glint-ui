"use client";

import { Check, Copy, Moon, Pause, Play, Sun, Volume2, VolumeX } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { IconShift } from "./icon-shift";

function IconButton({ label, onClick, children }: { label: string; onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className="grid size-12 place-items-center rounded-xl border border-border bg-background text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      {children}
    </button>
  );
}

export default function Demo(p: Record<string, unknown>) {
  const [copied, setCopied] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [dark, setDark] = useState(false);
  const [muted, setMuted] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const t = window.setTimeout(() => setCopied(false), 1400);
    return () => window.clearTimeout(t);
  }, [copied]);

  return (
    <div className="flex gap-3 rounded-2xl border border-border bg-card p-5 shadow-xl">
      <IconButton label={copied ? "Copied" : "Copy"} onClick={() => setCopied(true)}>
        <IconShift {...p} swapKey={copied}>
          {copied ? <Check className="size-5 text-emerald-500" /> : <Copy className="size-5" />}
        </IconShift>
      </IconButton>
      <IconButton label={playing ? "Pause" : "Play"} onClick={() => setPlaying((v) => !v)}>
        <IconShift {...p} swapKey={playing}>
          {playing ? <Pause className="size-5" /> : <Play className="size-5" />}
        </IconShift>
      </IconButton>
      <IconButton label={dark ? "Light mode" : "Dark mode"} onClick={() => setDark((v) => !v)}>
        <IconShift {...p} swapKey={dark}>
          {dark ? <Moon className="size-5" /> : <Sun className="size-5" />}
        </IconShift>
      </IconButton>
      <IconButton label={muted ? "Unmute" : "Mute"} onClick={() => setMuted((v) => !v)}>
        <IconShift {...p} swapKey={muted}>
          {muted ? <VolumeX className="size-5" /> : <Volume2 className="size-5" />}
        </IconShift>
      </IconButton>
    </div>
  );
}
