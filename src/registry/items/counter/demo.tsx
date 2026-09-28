"use client";

import { Counter } from "./counter";

export default function Demo(p: Record<string, unknown>) {
  return <Counter {...p} />;
}
