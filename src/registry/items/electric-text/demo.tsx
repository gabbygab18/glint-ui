"use client";

import { ElectricText } from "./electric-text";

export default function Demo(p: Record<string, unknown>) {
  return (
    <ElectricText text="" {...p} className="px-4 text-center text-5xl font-black tracking-tight sm:text-7xl" />
  );
}
