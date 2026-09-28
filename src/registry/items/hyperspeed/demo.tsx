"use client";

import { Title } from "../../demo-kit";
import { Hyperspeed } from "./hyperspeed";

export default function Demo(p: Record<string, unknown>) {
  return (
    <>
      <Hyperspeed {...p} />
      <Title>Hyperspeed</Title>
    </>
  );
}
