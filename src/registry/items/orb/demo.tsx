"use client";

import { Title } from "../../demo-kit";
import { Orb } from "./orb";

export default function Demo(p: Record<string, unknown>) {
  return (
    <>
      <Orb {...p} />
      <Title>Orb</Title>
    </>
  );
}
