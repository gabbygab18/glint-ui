"use client";

import { Title } from "../../demo-kit";
import { RippleGrid } from "./ripple-grid";

export default function Demo(p: Record<string, unknown>) {
  return (
    <>
      <RippleGrid {...p} />
      <Title>Ripple Grid</Title>
    </>
  );
}
