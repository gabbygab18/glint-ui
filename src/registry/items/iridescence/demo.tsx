"use client";

import { Title } from "../../demo-kit";
import { Iridescence } from "./iridescence";

export default function Demo(p: Record<string, unknown>) {
  return (
    <>
      <Iridescence {...p} />
      <Title>Iridescence</Title>
    </>
  );
}
