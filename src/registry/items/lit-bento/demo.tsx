"use client";

import { LitBento } from "./lit-bento";

export default function Demo(p: Record<string, unknown>) {
  return <LitBento {...p} className="px-4" />;
}
