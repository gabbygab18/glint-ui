"use client";

import { CometDial } from "./comet-dial";

export default function Demo(p: Record<string, unknown>) {
  return <CometDial key={`${p.defaultValue}-${p.min}-${p.max}`} {...p} />;
}
