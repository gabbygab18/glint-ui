"use client";

import { Title } from "../../demo-kit";
import { BeamsUpstream } from "./beams-upstream";

export default function Demo(p: Record<string, unknown>) {
  return (
    <>
      <BeamsUpstream {...p} />
      <Title>Beams Upstream</Title>
    </>
  );
}
