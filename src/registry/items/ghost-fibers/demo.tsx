"use client";

import { Title } from "../../demo-kit";
import { GhostFibers } from "./ghost-fibers";

export default function Demo(p: Record<string, unknown>) {
  return (
    <>
      <GhostFibers {...p} />
      <Title>Ghost Fibers</Title>
    </>
  );
}
