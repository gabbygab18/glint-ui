"use client";

import { Title } from "../../demo-kit";
import { WispFibers } from "./wisp-fibers";

export default function Demo(p: Record<string, unknown>) {
  return (
    <>
      <WispFibers {...p} />
      <Title>Wisp Fibers</Title>
    </>
  );
}
