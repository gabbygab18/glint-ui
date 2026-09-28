"use client";

import { Title } from "../../demo-kit";
import { Scanner } from "./scanner";

export default function Demo(p: Record<string, unknown>) {
  return (
    <>
      <Scanner {...p} />
      <Title>Scanner</Title>
    </>
  );
}
