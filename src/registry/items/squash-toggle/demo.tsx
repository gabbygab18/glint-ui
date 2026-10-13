"use client";

import { useState } from "react";
import { SquashToggle } from "./squash-toggle";

export default function Demo(p: Record<string, unknown>) {
  const [wifi, setWifi] = useState(true);
  const [bt, setBt] = useState(false);
  return (
    <div className="grid w-72 gap-5 rounded-2xl border border-border bg-card p-5 shadow-xl">
      <SquashToggle key={String(p.defaultChecked)} {...p} />
      <SquashToggle label="Wi-Fi" checked={wifi} onChange={setWifi} color="#3b82f6" />
      <SquashToggle label="Bluetooth" checked={bt} onChange={setBt} color="#a855f7" />
    </div>
  );
}
