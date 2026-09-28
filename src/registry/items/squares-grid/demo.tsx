"use client";

import { Title } from "../../demo-kit";
import { SquaresGrid } from "./squares-grid";

export default function Demo(p: Record<string, unknown>) {
  return (
    <>
      <SquaresGrid {...p} />
      <Title>Squares Grid</Title>
    </>
  );
}
