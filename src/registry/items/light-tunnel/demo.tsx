"use client";

import { Title } from "../../demo-kit";
import { LightTunnel } from "./light-tunnel";

export default function Demo(p: Record<string, unknown>) {
  return (
    <>
      <LightTunnel {...p} />
      <Title>Light Tunnel</Title>
    </>
  );
}
