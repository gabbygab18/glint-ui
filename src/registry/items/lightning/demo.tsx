"use client";

import { Title } from "../../demo-kit";
import { Lightning } from "./lightning";

export default function Demo(p: Record<string, unknown>) {
  return (
    <>
      <Lightning {...p} />
      <Title>Lightning</Title>
    </>
  );
}
