"use client";

import { stackCards } from "../../demo-kit";
import { SwipeStack } from "./swipe-stack";

export default function Demo(p: Record<string, unknown>) {
  return <SwipeStack cards={stackCards} {...p} />;
}
