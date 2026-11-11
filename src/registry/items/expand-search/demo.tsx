"use client";

import { useState } from "react";
import { ExpandSearch } from "./expand-search";

export default function Demo(p: Record<string, unknown>) {
  const [last, setLast] = useState<string>();

  return (
    <div className="w-[26rem] max-w-full rounded-2xl border border-border bg-background shadow-xl">
      <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-3">
        <span className="text-sm font-semibold text-foreground">Docs</span>
        <ExpandSearch {...p} onSearch={setLast} />
      </div>
      <p className="px-4 py-10 text-center text-sm text-muted-foreground" aria-live="polite">
        {last ? (
          <>
            Searching for <span className="font-medium text-foreground">“{last}”</span>
          </>
        ) : (
          "Press the search button, type, then Enter."
        )}
      </p>
    </div>
  );
}
