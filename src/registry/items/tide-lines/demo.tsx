"use client";

import { Title } from "../../demo-kit";
import { TideLines } from "./tide-lines";

export default function Demo(p: Record<string, unknown>) {
  return (
    <>
      <TideLines {...p} />
      <Title>Tide Lines</Title>
    </>
  );
}
