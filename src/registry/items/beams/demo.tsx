"use client";

import { Title } from "../../demo-kit";
import { Beams } from "./beams";

export default function Demo(p: Record<string, unknown>) {
  return (
    <>
      <Beams {...p} />
      <Title>Beams</Title>
    </>
  );
}
