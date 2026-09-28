"use client";

import { notifications } from "../../demo-kit";
import { AnimatedList } from "./animated-list";

export default function Demo(p: Record<string, unknown>) {
  return <AnimatedList items={notifications} {...p} className="h-80" />;
}
