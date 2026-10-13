"use client";

import { Title } from "../../demo-kit";
import { GlassDrift } from "./glass-drift";

export default function Demo(p: Record<string, unknown>) {
  return (
    <>
      <GlassDrift {...p} />
      <Title>Glass Drift</Title>
    </>
  );
}
