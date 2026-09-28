"use client";

import { useState } from "react";
import { Shredder } from "./shredder";

export default function Demo(p: Record<string, unknown>) {
  const [n, setN] = useState(0);
  return (
    <div className="flex flex-col items-center pt-6">
      {/* When the undo window closes, feed in a fresh document. */}
      <Shredder key={n} {...p} title={n ? `draft-v${n + 1}.pdf` : (p.title as string | undefined)} onExpire={() => setTimeout(() => setN((x) => x + 1), 600)} />
    </div>
  );
}
