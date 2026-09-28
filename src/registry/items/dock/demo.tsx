"use client";

import { dockItems } from "../../demo-kit";
import { Dock } from "./dock";

export default function Demo(p: Record<string, unknown>) {
  return <Dock items={dockItems} {...p} />;
}
