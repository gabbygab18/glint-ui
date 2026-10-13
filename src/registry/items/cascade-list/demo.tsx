"use client";

import { notifications } from "../../demo-kit";
import { CascadeList } from "./cascade-list";

export default function Demo(p: Record<string, unknown>) {
  return <CascadeList items={notifications} {...p} className="h-80" />;
}
