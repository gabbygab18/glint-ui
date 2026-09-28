"use client";

import { Title } from "../../demo-kit";
import { EvilEye } from "./evil-eye";

export default function Demo(p: Record<string, unknown>) {
  return (
    <>
      <EvilEye {...p} />
      <Title>Evil Eye</Title>
    </>
  );
}
