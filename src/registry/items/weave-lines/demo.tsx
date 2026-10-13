"use client";

import { Title } from "../../demo-kit";
import { WeaveLines } from "./weave-lines";

export default function Demo(p: Record<string, unknown>) {
  return (
    <>
      <WeaveLines {...p} />
      <Title>Weave Lines</Title>
    </>
  );
}
