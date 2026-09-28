"use client";

import { Title } from "../../demo-kit";
import { LightRays } from "./light-rays";

export default function Demo(p: Record<string, unknown>) {
  return (
    <>
      <LightRays {...p} />
      <Title>Light Rays</Title>
    </>
  );
}
