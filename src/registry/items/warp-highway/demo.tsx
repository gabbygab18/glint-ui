"use client";

import { Title } from "../../demo-kit";
import { WarpHighway } from "./warp-highway";

export default function Demo(p: Record<string, unknown>) {
  return (
    <>
      <WarpHighway {...p} />
      <Title>Warp Highway</Title>
    </>
  );
}
