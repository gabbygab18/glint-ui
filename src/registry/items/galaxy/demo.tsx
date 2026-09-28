"use client";

import { Title } from "../../demo-kit";
import { Galaxy } from "./galaxy";

export default function Demo(p: Record<string, unknown>) {
  return (
    <>
      <Galaxy {...p} />
      <Title>Galaxy</Title>
    </>
  );
}
