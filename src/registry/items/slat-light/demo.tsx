"use client";

import { Title } from "../../demo-kit";
import { SlatLight } from "./slat-light";

export default function Demo(p: Record<string, unknown>) {
  return (
    <>
      <SlatLight {...p} />
      <Title>Slat Light</Title>
    </>
  );
}
