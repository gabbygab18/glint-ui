"use client";

import { useState } from "react";
import { DurationPicker, type DurationValue } from "./duration-picker";

export default function Demo(p: Record<string, unknown>) {
  const [value, setValue] = useState<DurationValue>({ hours: 1, minutes: 30 });
  const [saved, setSaved] = useState<DurationValue>(value);

  return (
    <div className="flex flex-col items-center gap-5 px-4">
      <DurationPicker {...p} value={value} onChange={setValue} onConfirm={setSaved} />
      <p className="text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
        Tap the pen to edit · saved {saved.hours}h {saved.minutes}m
      </p>
    </div>
  );
}
