"use client";

import { Title } from "../../demo-kit";
import { DotField } from "./dot-field";

export default function Demo(p: Record<string, unknown>) {
  return (
    <>
      <DotField {...p} />
      <Title>Dot Field</Title>
    </>
  );
}
