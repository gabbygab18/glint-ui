"use client";

import { Title } from "../../demo-kit";
import { GlowSphere } from "./glow-sphere";

export default function Demo(p: Record<string, unknown>) {
  return (
    <>
      <GlowSphere {...p} />
      <Title>Glow Sphere</Title>
    </>
  );
}
