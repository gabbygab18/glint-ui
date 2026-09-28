"use client";

import { useEffect, useRef, useState } from "react";
import { StatusMark, type StatusMarkStatus } from "./status-mark";

const states: StatusMarkStatus[] = ["idle", "loading", "success", "error"];
const copy: Record<StatusMarkStatus, string> = {
  idle: "Ready to deploy",
  loading: "Deploying…",
  success: "Live on production",
  error: "Build failed",
};

export default function Demo(p: Record<string, unknown>) {
  const [status, setStatus] = useState<StatusMarkStatus>((p.status as StatusMarkStatus) ?? "idle");
  const runs = useRef(0);
  const timer = useRef<number | undefined>(undefined);
  useEffect(() => () => window.clearTimeout(timer.current), []);
  // Follow the playground's status control when it changes.
  const [prev, setPrev] = useState(p.status);
  if (p.status !== prev) {
    setPrev(p.status);
    if (p.status) setStatus(p.status as StatusMarkStatus);
  }

  const deploy = () => {
    window.clearTimeout(timer.current);
    setStatus("loading");
    timer.current = window.setTimeout(() => setStatus(runs.current++ % 3 === 2 ? "error" : "success"), 1800);
  };

  return (
    <div className="flex w-80 flex-col gap-5 rounded-2xl border border-border bg-card p-5 shadow-xl">
      <div className="flex items-center gap-4">
        <StatusMark {...p} status={status} />
        <div>
          <p className="text-sm font-semibold text-foreground">acme-web</p>
          <p className="text-xs text-muted-foreground">{copy[status]}</p>
        </div>
        <button
          type="button"
          onClick={deploy}
          disabled={status === "loading"}
          className="ml-auto h-8 rounded-lg bg-primary px-3 text-xs font-semibold text-primary-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
        >
          Deploy
        </button>
      </div>
      <div className="grid grid-cols-4 gap-1 rounded-lg bg-muted p-1">
        {states.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setStatus(s)}
            className={`h-7 rounded-md text-xs capitalize outline-none focus-visible:ring-2 focus-visible:ring-ring ${
              status === s ? "bg-background font-medium text-foreground shadow" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {s}
          </button>
        ))}
      </div>
    </div>
  );
}
