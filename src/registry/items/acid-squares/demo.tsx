"use client";

import { Title } from "../../demo-kit";
import { AcidSquares } from "./acid-squares";

export default function Demo(p: Record<string, unknown>) {
  return (
    <>
      <AcidSquares {...p} />
      <Title>Acid Squares</Title>
    </>
  );
}
