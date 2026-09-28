"use client";

import { Title } from "../../demo-kit";
import { Lightfall } from "./lightfall";

export default function Demo(p: Record<string, unknown>) {
  return (
    <>
      <Lightfall {...p} />
      <Title>Lightfall</Title>
    </>
  );
}
