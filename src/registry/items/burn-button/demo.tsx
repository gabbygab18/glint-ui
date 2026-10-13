"use client";

import { BurnButton } from "./burn-button";

export default function Demo(p: Record<string, unknown>) {
  return <BurnButton {...p}>Hold to launch</BurnButton>;
}
