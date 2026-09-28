"use client";

import { Title } from "../../demo-kit";
import { GradientBlinds } from "./gradient-blinds";

export default function Demo(p: Record<string, unknown>) {
  return (
    <>
      <GradientBlinds {...p} />
      <Title>Gradient Blinds</Title>
    </>
  );
}
