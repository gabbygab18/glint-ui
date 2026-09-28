"use client";

import { Title } from "../../demo-kit";
import { GridBackground } from "./grid-background";

export default function Demo(p: Record<string, unknown>) {
  return (
    <>
      <GridBackground {...p} />
      <Title>Grid Background</Title>
    </>
  );
}
