"use client";

import { SlideText } from "./slide-text";

export default function Demo(p: Record<string, unknown>) {
  return (
    <div className="flex flex-col items-center gap-10 px-4 text-center">
      <SlideText text="" {...p} className="text-6xl font-bold tracking-tight text-foreground sm:text-8xl" />
      <nav className="flex gap-8 text-lg font-medium text-muted-foreground">
        {["Work", "Studio", "Journal", "Contact"].map((t) => (
          <a key={t} href="#" onClick={(e) => e.preventDefault()} className="rounded outline-none focus-visible:ring-2 focus-visible:ring-ring">
            <SlideText {...p} text={t} active={false} />
          </a>
        ))}
      </nav>
    </div>
  );
}
