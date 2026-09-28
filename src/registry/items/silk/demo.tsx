"use client";

import { Title } from "../../demo-kit";
import { Silk } from "./silk";

export default function Demo(p: Record<string, unknown>) {
  return (
    <>
      <Silk {...p} />
      <Title>Silk</Title>
    </>
  );
}
