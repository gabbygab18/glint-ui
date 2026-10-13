"use client";

import { Title } from "../../demo-kit";
import { WaveMesh } from "./wave-mesh";

export default function Demo(p: Record<string, unknown>) {
  return (
    <>
      <WaveMesh {...p} />
      <Title>Wave Mesh</Title>
    </>
  );
}
