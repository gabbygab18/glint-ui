"use client";

import { MagicBento } from "./magic-bento";

export default function Demo(p: Record<string, unknown>) {
  return <MagicBento {...p} className="px-4" />;
}
