"use client";

import { Title } from "../../demo-kit";
import { SpikeBlob } from "./spike-blob";

export default function Demo(p: Record<string, unknown>) {
  return (
    <>
      <SpikeBlob {...p} />
      <Title>Spike Blob</Title>
    </>
  );
}
