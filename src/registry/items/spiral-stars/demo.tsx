"use client";

import { Title } from "../../demo-kit";
import { SpiralStars } from "./spiral-stars";

export default function Demo(p: Record<string, unknown>) {
  return (
    <>
      <SpiralStars {...p} />
      <Title>Spiral Stars</Title>
    </>
  );
}
