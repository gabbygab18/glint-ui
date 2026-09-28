"use client";

import { logos } from "../../demo-kit";
import { Marquee } from "./marquee";

export default function Demo(p: Record<string, unknown>) {
  return <Marquee items={logos} {...p} className="w-full" />;
}
