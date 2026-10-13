"use client";

import { Title } from "../../demo-kit";
import { GlowEddies } from "./glow-eddies";

export default function Demo(p: Record<string, unknown>) {
  return (
    <>
      <GlowEddies {...p} />
      <Title>Glow Eddies</Title>
    </>
  );
}
