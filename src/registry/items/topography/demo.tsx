"use client";

import { Title } from "../../demo-kit";
import { Topography } from "./topography";

export default function Demo(p: Record<string, unknown>) {
  return (
    <>
      <Topography {...p} />
      <Title>Topography</Title>
    </>
  );
}
