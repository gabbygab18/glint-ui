"use client";

import { Title } from "../../demo-kit";
import { MagmaCrust } from "./magma-crust";

export default function Demo(p: Record<string, unknown>) {
  return (
    <>
      <MagmaCrust {...p} />
      <Title>Magma Crust</Title>
    </>
  );
}
