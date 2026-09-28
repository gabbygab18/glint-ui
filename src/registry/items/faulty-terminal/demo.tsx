"use client";

import { Title } from "../../demo-kit";
import { FaultyTerminal } from "./faulty-terminal";

export default function Demo(p: Record<string, unknown>) {
  return (
    <>
      <FaultyTerminal {...p} />
      <Title>Faulty Terminal</Title>
    </>
  );
}
