"use client";

import { Title } from "../../demo-kit";
import { Antigravity } from "./antigravity";

export default function Demo(p: Record<string, unknown>) {
  return (
    <>
      <Antigravity {...p} />
      <Title>Antigravity</Title>
    </>
  );
}
