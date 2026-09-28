"use client";

import { Title } from "../../demo-kit";
import { Plasma } from "./plasma";

export default function Demo(p: Record<string, unknown>) {
  return (
    <>
      <Plasma {...p} />
      <Title>Plasma</Title>
    </>
  );
}
