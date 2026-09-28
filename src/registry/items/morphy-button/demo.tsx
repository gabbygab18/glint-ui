"use client";

import { useEffect, useRef, useState } from "react";
import { MorphyButton, type MorphyStatus } from "./morphy-button";

export default function Demo(p: Record<string, unknown>) {
  const [cycle, setCycle] = useState<MorphyStatus>("idle");
  const timers = useRef<number[]>([]);
  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const run = () => {
    if (cycle !== "idle") return;
    setCycle("loading");
    timers.current = [
      window.setTimeout(() => setCycle("success"), 1600),
      window.setTimeout(() => setCycle("idle"), 3000),
    ];
  };

  const status = cycle === "idle" ? ((p.status as MorphyStatus) ?? "idle") : cycle;
  return (
    <MorphyButton {...p} status={status} onClick={run}>
      Save changes
    </MorphyButton>
  );
}
