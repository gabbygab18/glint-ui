"use client";

import { Title } from "../../demo-kit";
import { Waves } from "./waves";

export default function Demo(p: Record<string, unknown>) {
  return (
    <>
      <Waves {...p} />
      <Title>Waves</Title>
    </>
  );
}
