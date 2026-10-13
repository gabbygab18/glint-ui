"use client";

import { Title } from "../../demo-kit";
import { NorthGlow } from "./north-glow";

export default function Demo(p: Record<string, unknown>) {
  return (
    <>
      <NorthGlow {...p} />
      <Title>North Glow</Title>
    </>
  );
}
