"use client";

import { Title } from "../../demo-kit";
import { StripGradient } from "./strip-gradient";

export default function Demo(p: Record<string, unknown>) {
  return (
    <>
      <StripGradient {...p} />
      <Title>Strip Gradient</Title>
    </>
  );
}
