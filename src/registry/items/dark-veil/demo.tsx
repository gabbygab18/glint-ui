"use client";

import { Title } from "../../demo-kit";
import { DarkVeil } from "./dark-veil";

export default function Demo(p: Record<string, unknown>) {
  return (
    <>
      <DarkVeil {...p} />
      <Title>Dark Veil</Title>
    </>
  );
}
