"use client";

import { Title } from "../../demo-kit";
import { Ferrofluid } from "./ferrofluid";

export default function Demo(p: Record<string, unknown>) {
  return (
    <>
      <Ferrofluid {...p} />
      <Title>Ferrofluid</Title>
    </>
  );
}
