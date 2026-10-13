"use client";

import { Title } from "../../demo-kit";
import { NeonChecker } from "./neon-checker";

export default function Demo(p: Record<string, unknown>) {
  return (
    <>
      <NeonChecker {...p} />
      <Title>Neon Checker</Title>
    </>
  );
}
