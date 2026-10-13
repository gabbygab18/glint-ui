"use client";

import { Title } from "../../demo-kit";
import { LavaGloss } from "./lava-gloss";

export default function Demo(p: Record<string, unknown>) {
  return (
    <>
      <LavaGloss {...p} />
      <Title>Lava Gloss</Title>
    </>
  );
}
