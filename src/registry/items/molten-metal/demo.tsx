"use client";

import { Title } from "../../demo-kit";
import { MoltenMetal } from "./molten-metal";

export default function Demo(p: Record<string, unknown>) {
  return (
    <>
      <MoltenMetal {...p} />
      <Title>Molten Metal</Title>
    </>
  );
}
