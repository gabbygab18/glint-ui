"use client";

import { Title } from "../../demo-kit";
import { LayerSwells } from "./layer-swells";

export default function Demo(p: Record<string, unknown>) {
  return (
    <>
      <LayerSwells {...p} />
      <Title>Layer Swells</Title>
    </>
  );
}
