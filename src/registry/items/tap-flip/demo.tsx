"use client";

import { TapFlip } from "./tap-flip";

export default function Demo(p: Record<string, unknown>) {
  return <TapFlip key={String(p.defaultFlipped)} {...p} />;
}
