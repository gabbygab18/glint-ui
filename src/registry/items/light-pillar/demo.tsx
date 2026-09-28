"use client";

import { Title } from "../../demo-kit";
import { LightPillar } from "./light-pillar";

export default function Demo(p: Record<string, unknown>) {
  return (
    <>
      <LightPillar {...p} />
      <Title>Light Pillar</Title>
    </>
  );
}
