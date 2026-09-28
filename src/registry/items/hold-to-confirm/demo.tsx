"use client";

import { HoldToConfirm } from "./hold-to-confirm";

export default function Demo(p: Record<string, unknown>) {
  return <HoldToConfirm {...p} />;
}
