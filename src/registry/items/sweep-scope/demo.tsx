"use client";

import { Title } from "../../demo-kit";
import { SweepScope } from "./sweep-scope";

export default function Demo(p: Record<string, unknown>) {
  return (
    <>
      <SweepScope {...p} />
      <Title>Sweep Scope</Title>
    </>
  );
}
