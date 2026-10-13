"use client";

import { Title } from "../../demo-kit";
import { BeamSplitter } from "./beam-splitter";

export default function Demo(p: Record<string, unknown>) {
  return (
    <>
      <BeamSplitter {...p} />
      <Title>Beam Splitter</Title>
    </>
  );
}
