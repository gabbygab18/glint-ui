"use client";

import { Title } from "../../demo-kit";
import { RopeCurtain } from "./rope-curtain";

export default function Demo(p: Record<string, unknown>) {
  return (
    <>
      <RopeCurtain {...p} />
      <Title>Rope Curtain</Title>
    </>
  );
}
