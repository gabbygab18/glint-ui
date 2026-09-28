"use client";

import { Title } from "../../demo-kit";
import { SoftAurora } from "./soft-aurora";

export default function Demo(p: Record<string, unknown>) {
  return (
    <>
      <SoftAurora {...p} />
      <Title>Soft Aurora</Title>
    </>
  );
}
