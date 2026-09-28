"use client";

import { Title } from "../../demo-kit";
import { Swirl } from "./swirl";

export default function Demo(p: Record<string, unknown>) {
  return (
    <>
      <Swirl {...p} />
      <Title>Swirl</Title>
    </>
  );
}
