"use client";

import { useEffect, useState } from "react";
import { ThoughtLine } from "./thought-line";

const trace = [
  "Reading the question",
  "Searching the docs for rate limits",
  "Comparing token bucket vs sliding window",
  "Checking edge cases for burst traffic",
  "Drafting the answer",
];

export default function Demo(p: Record<string, unknown>) {
  const [run, setRun] = useState(0);
  const [count, setCount] = useState(1);
  const running = count <= trace.length;

  useEffect(() => {
    if (!running) return;
    const id = setTimeout(() => setCount((c) => c + 1), 1500);
    return () => clearTimeout(id);
  }, [count, running]);

  return (
    <div className="flex w-full max-w-md flex-col gap-4 px-4">
      <div className="min-h-64 rounded-2xl border border-border bg-card p-5 shadow-xl">
        <p className="mb-3 ml-auto w-fit rounded-2xl bg-muted px-3 py-2 text-sm text-foreground">
          How should I rate-limit my API?
        </p>
        <ThoughtLine key={run} {...p} steps={trace.slice(0, count)} running={running} />
        {!running && (
          <p className="mt-3 text-sm text-foreground">
            Use a token bucket per API key: it allows short bursts while holding a steady average rate.
          </p>
        )}
      </div>
      <button
        type="button"
        onClick={() => {
          setRun((r) => r + 1);
          setCount(1);
        }}
        className="mx-auto rounded-full border border-border bg-card px-3 py-1.5 text-xs font-medium text-foreground hover:bg-muted focus-visible:outline-2 focus-visible:outline-ring"
      >
        Think again
      </button>
    </div>
  );
}
