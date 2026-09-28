"use client";

import { Title } from "../../demo-kit";
import { LiquidEther } from "./liquid-ether";

export default function Demo(p: Record<string, unknown>) {
  return (
    <>
      <LiquidEther {...p} />
      <Title>Liquid Ether</Title>
    </>
  );
}
