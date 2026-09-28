"use client";

import { Title } from "../../demo-kit";
import { CrtWarp } from "./crt-warp";

export default function Demo(p: Record<string, unknown>) {
  return (
    <>
      <CrtWarp {...p} />
      <Title>CRT Warp</Title>
    </>
  );
}
