"use client";

import { Title } from "../../demo-kit";
import { CosmicBackground } from "./cosmic-background";

export default function Demo(p: Record<string, unknown>) {
  return (
    <>
      <CosmicBackground {...p} />
      <Title>Cosmic Background</Title>
    </>
  );
}
