"use client";

import { Title } from "../../demo-kit";
import { GodRays } from "./god-rays";

export default function Demo(p: Record<string, unknown>) {
  return (
    <>
      <GodRays {...p} />
      <Title>God Rays</Title>
    </>
  );
}
