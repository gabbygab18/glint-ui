"use client";

import { Title } from "../../demo-kit";
import { SideRays } from "./side-rays";

export default function Demo(p: Record<string, unknown>) {
  return (
    <>
      <SideRays {...p} />
      <Title>Side Rays</Title>
    </>
  );
}
