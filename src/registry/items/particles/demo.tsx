"use client";

import { Title } from "../../demo-kit";
import { Particles } from "./particles";

export default function Demo(p: Record<string, unknown>) {
  return (
    <>
      <Particles {...p} />
      <Title>Particles</Title>
    </>
  );
}
