"use client";

import { JellyRadio } from "./jelly-radio";

export default function Demo(p: Record<string, unknown>) {
  return <JellyRadio key={String(p.defaultValue)} {...p} />;
}
