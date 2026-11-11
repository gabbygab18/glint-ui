"use client";

import { FileDrop } from "./file-drop";

// Pretend upload: progress ticks up at a random pace, like a real network.
const fakeUpload = (_file: File, onProgress: (p: number) => void) =>
  new Promise<void>((resolve) => {
    let p = 0;
    const t = window.setInterval(() => {
      p = Math.min(1, p + 0.06 + Math.random() * 0.12);
      onProgress(p);
      if (p >= 1) {
        window.clearInterval(t);
        resolve();
      }
    }, 180);
  });

export default function Demo(p: Record<string, unknown>) {
  return (
    <div className="w-80 rounded-2xl border border-border bg-card p-4 shadow-xl">
      <FileDrop upload={fakeUpload} {...p} />
    </div>
  );
}
