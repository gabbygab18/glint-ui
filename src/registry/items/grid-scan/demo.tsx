"use client";

import { Title } from "../../demo-kit";
import { GridScan } from "./grid-scan";

export default function Demo(p: Record<string, unknown>) {
  return (
    <>
      <GridScan {...p} />
      <Title>Grid Scan</Title>
    </>
  );
}
