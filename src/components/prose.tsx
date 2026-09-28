import type { ReactNode } from "react";

/** Minimal typographic wrapper for docs pages. */
export function Prose({ children }: { children: ReactNode }) {
  return (
    <div className="max-w-3xl text-[15px] leading-7 text-muted-foreground [&_code]:rounded-md [&_code]:bg-muted [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:text-[13px] [&_code]:text-foreground [&_h2]:mb-3 [&_h2]:mt-12 [&_h2]:font-display [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:text-foreground [&_li]:ml-5 [&_li]:list-disc [&_p]:mb-4 [&_strong]:text-foreground">
      {children}
    </div>
  );
}
