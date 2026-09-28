"use client";

import { ToggleVault } from "./toggle-vault";

export default function Demo(p: Record<string, unknown>) {
  return <ToggleVault key={String(p.defaultLocked)} {...p} />;
}
