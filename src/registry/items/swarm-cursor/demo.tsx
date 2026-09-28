"use client";

import { Title } from "../../demo-kit";
import { SwarmCursor } from "./swarm-cursor";

export default function Demo(p: Record<string, unknown>) {
  return (
    <>
      <SwarmCursor {...p} />
      <Title>Swarm Cursor</Title>
    </>
  );
}
