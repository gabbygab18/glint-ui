"use client";

import { Title } from "../../demo-kit";
import { Radar } from "./radar";

export default function Demo(p: Record<string, unknown>) {
  return (
    <>
      <Radar {...p} />
      <Title>Radar</Title>
    </>
  );
}
