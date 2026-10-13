"use client";

import { Title } from "../../demo-kit";
import { ClothWire } from "./cloth-wire";

export default function Demo(p: Record<string, unknown>) {
  return (
    <>
      <ClothWire {...p} />
      <Title>Cloth Wire</Title>
    </>
  );
}
