"use client";

import { Title } from "../../demo-kit";
import { AeroShards } from "./aero-shards";

export default function Demo(p: Record<string, unknown>) {
  return (
    <>
      <AeroShards {...p} />
      <Title>Aero Shards</Title>
    </>
  );
}
