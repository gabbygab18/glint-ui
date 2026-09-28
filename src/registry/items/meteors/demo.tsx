"use client";

import { Title } from "../../demo-kit";
import { Meteors } from "./meteors";

export default function Demo(p: Record<string, unknown>) {
  return (
    <>
      <Meteors {...p} />
      <Title>Meteors</Title>
    </>
  );
}
