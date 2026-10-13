"use client";

import { Title } from "../../demo-kit";
import { NeonFloor } from "./neon-floor";

export default function Demo(p: Record<string, unknown>) {
  return (
    <>
      <NeonFloor {...p} />
      <Title>Neon Floor</Title>
    </>
  );
}
