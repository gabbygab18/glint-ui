"use client";

import { Title } from "../../demo-kit";
import { BlindLight } from "./blind-light";

export default function Demo(p: Record<string, unknown>) {
  return (
    <>
      <BlindLight {...p} />
      <Title>Blind Light</Title>
    </>
  );
}
