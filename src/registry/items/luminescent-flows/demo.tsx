"use client";

import { Title } from "../../demo-kit";
import { LuminescentFlows } from "./luminescent-flows";

export default function Demo(p: Record<string, unknown>) {
  return (
    <>
      <LuminescentFlows {...p} />
      <Title>Luminescent Flows</Title>
    </>
  );
}
