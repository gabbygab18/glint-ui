"use client";

import { SheenType } from "./sheen-type";

export default function Demo(p: Record<string, unknown>) {
  return <SheenType text="" {...p} className="text-4xl font-semibold tracking-tight sm:text-5xl" />;
}
