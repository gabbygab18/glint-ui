"use client";

import { useEffect, useState } from "react";
import { Progress } from "./progress";

export default function Demo({ indeterminate, ...p }: Record<string, unknown>) {
  const [upload, setUpload] = useState(12);
  useEffect(() => {
    const steps = [9, 14, 6, 18, 11, 7, 15];
    let i = 0;
    const t = setInterval(() => setUpload((v) => (v >= 100 ? 8 : Math.min(100, v + steps[i++ % steps.length]))), 900);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="grid w-full max-w-md gap-8 rounded-2xl border border-border bg-card p-6 shadow-xl">
      <Progress {...p} value={indeterminate ? null : (p.value as number | undefined)} />
      <Progress label="Uploading design-system.fig" value={upload} size="sm" />
      <div className="flex items-end justify-around">
        <Progress variant="circular" size="sm" value={upload} showValue={false} label="Sync" />
        <Progress variant="circular" value={upload} label="Upload" />
        <Progress variant="circular" size="lg" value={72} label="Storage" />
        <Progress variant="circular" value={null} label="Indexing" />
      </div>
    </div>
  );
}
