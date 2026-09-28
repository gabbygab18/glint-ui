"use client";

import { Title } from "../../demo-kit";
import { BoltStrike } from "./bolt-strike";

export default function Demo(p: Record<string, unknown>) {
  return (
    <>
      <BoltStrike {...p} />
      <Title>Bolt Strike</Title>
    </>
  );
}
