"use client";

import { Title } from "../../demo-kit";
import { Strands } from "./strands";

export default function Demo(p: Record<string, unknown>) {
  return (
    <>
      <Strands {...p} />
      <Title>Strands</Title>
    </>
  );
}
