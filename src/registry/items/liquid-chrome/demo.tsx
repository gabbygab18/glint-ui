"use client";

import { Title } from "../../demo-kit";
import { LiquidChrome } from "./liquid-chrome";

export default function Demo(p: Record<string, unknown>) {
  return (
    <>
      <LiquidChrome {...p} />
      <Title>Liquid Chrome</Title>
    </>
  );
}
