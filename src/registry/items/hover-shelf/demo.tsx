"use client";

import { dockItems } from "../../demo-kit";
import { HoverShelf } from "./hover-shelf";

export default function Demo(p: Record<string, unknown>) {
  return <HoverShelf items={dockItems} {...p} />;
}
