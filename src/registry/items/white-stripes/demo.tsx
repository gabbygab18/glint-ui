"use client";

import { Title } from "../../demo-kit";
import { WhiteStripes } from "./white-stripes";

export default function Demo(p: Record<string, unknown>) {
  return (
    <>
      <WhiteStripes {...p} />
      <Title>White Stripes</Title>
    </>
  );
}
