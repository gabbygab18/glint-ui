"use client";

import { GooRadio } from "./goo-radio";

export default function Demo(p: Record<string, unknown>) {
  return <GooRadio key={String(p.defaultValue)} {...p} />;
}
