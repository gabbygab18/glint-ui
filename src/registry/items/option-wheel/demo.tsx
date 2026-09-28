"use client";

import { useState } from "react";
import { OptionWheel } from "./option-wheel";

const hours = Array.from({ length: 12 }, (_, i) => String(i + 1));
const minutes = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, "0"));
const periods = ["AM", "PM"];

export default function Demo(p: Record<string, unknown>) {
  const [t, setT] = useState({ h: "7", m: "30", p: "AM" });
  return (
    <div className="w-72 rounded-3xl border border-border bg-card p-5 shadow-2xl">
      <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">Alarm</p>
      <p className="mb-4 text-3xl font-semibold tabular-nums tracking-tight text-foreground">
        {t.h}:{t.m} <span className="text-lg text-muted-foreground">{t.p}</span>
      </p>
      <div className="grid grid-cols-[1fr_1fr_auto] gap-1">
        <OptionWheel {...p} options={hours} defaultIndex={6} label="Hour" onChange={(h) => setT((s) => ({ ...s, h }))} />
        <OptionWheel {...p} options={minutes} defaultIndex={30} label="Minute" onChange={(m) => setT((s) => ({ ...s, m }))} />
        <OptionWheel {...p} loop={false} options={periods} defaultIndex={0} label="AM or PM" onChange={(v) => setT((s) => ({ ...s, p: v }))} />
      </div>
    </div>
  );
}
