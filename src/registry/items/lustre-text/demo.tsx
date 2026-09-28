"use client";

import { LustreText } from "./lustre-text";

export default function Demo(p: Record<string, unknown>) {
  return <LustreText text="" {...p} className="px-4 text-center text-6xl font-black tracking-tight sm:text-8xl" />;
}
