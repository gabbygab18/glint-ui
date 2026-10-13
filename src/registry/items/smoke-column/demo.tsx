"use client";

import { Title } from "../../demo-kit";
import { SmokeColumn } from "./smoke-column";

export default function Demo(p: Record<string, unknown>) {
  return (
    <>
      <SmokeColumn {...p} />
      <Title>Smoke Column</Title>
    </>
  );
}
