"use client";

import { Title } from "../../demo-kit";
import { AuroraDots } from "./aurora-dots";

export default function Demo(p: Record<string, unknown>) {
  return (
    <>
      <AuroraDots {...p} />
      <Title>Aurora Dots</Title>
    </>
  );
}
