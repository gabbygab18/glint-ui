"use client";

import { Title } from "../../demo-kit";
import { MovingLines } from "./moving-lines";

export default function Demo(p: Record<string, unknown>) {
  return (
    <>
      <MovingLines {...p} />
      <Title>Moving Lines</Title>
    </>
  );
}
