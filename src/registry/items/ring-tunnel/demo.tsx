"use client";

import { Title } from "../../demo-kit";
import { RingTunnel } from "./ring-tunnel";

export default function Demo(p: Record<string, unknown>) {
  return (
    <>
      <RingTunnel {...p} />
      <Title>Ring Tunnel</Title>
    </>
  );
}
