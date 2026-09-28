"use client";

import { Title } from "../../demo-kit";
import { DotGrid } from "./dot-grid";

export default function Demo(p: Record<string, unknown>) {
  return (
    <>
      <DotGrid {...p} />
      <Title>Dot Grid</Title>
    </>
  );
}
