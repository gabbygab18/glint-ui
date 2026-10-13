"use client";

import { TintType } from "./tint-type";

export default function Demo(p: Record<string, unknown>) {
  return <TintType text="" {...p} className="text-5xl font-bold tracking-tight sm:text-6xl" />;
}
