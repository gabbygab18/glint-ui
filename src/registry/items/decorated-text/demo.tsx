"use client";

import { DecoratedText } from "./decorated-text";

export default function Demo(p: Record<string, unknown>) {
  return (
    <div className="flex flex-col items-center gap-6 px-6 text-center">
      <p className="text-sm tracking-[0.3em] text-muted-foreground uppercase">Studio notes</p>
      <DecoratedText key={`${p.decoration}-${p.trigger}`} text="" {...p} className="text-4xl font-semibold tracking-tight text-foreground sm:text-6xl" />
      <p className="max-w-md text-muted-foreground">Hover the phrase to nudge the brackets.</p>
    </div>
  );
}
