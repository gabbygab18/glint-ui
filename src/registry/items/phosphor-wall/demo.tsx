"use client";

import { Title } from "../../demo-kit";
import { PhosphorWall } from "./phosphor-wall";

export default function Demo(p: Record<string, unknown>) {
  return (
    <>
      <PhosphorWall {...p} />
      <Title>Phosphor Wall</Title>
    </>
  );
}
