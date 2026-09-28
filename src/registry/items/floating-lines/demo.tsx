"use client";

import { Title } from "../../demo-kit";
import { FloatingLines } from "./floating-lines";

export default function Demo(p: Record<string, unknown>) {
  return (
    <>
      <FloatingLines {...p} />
      <Title>Floating Lines</Title>
    </>
  );
}
