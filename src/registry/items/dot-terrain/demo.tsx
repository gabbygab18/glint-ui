"use client";

import { Title } from "../../demo-kit";
import { DotTerrain } from "./dot-terrain";

export default function Demo(p: Record<string, unknown>) {
  return (
    <>
      <DotTerrain {...p} />
      <Title>Dot Terrain</Title>
    </>
  );
}
