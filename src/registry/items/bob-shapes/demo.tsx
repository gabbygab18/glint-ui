"use client";

import { Title } from "../../demo-kit";
import { BobShapes } from "./bob-shapes";

export default function Demo(p: Record<string, unknown>) {
  return (
    <>
      <BobShapes {...p} />
      <Title>Bob Shapes</Title>
    </>
  );
}
