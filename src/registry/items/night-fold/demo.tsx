"use client";

import { Title } from "../../demo-kit";
import { NightFold } from "./night-fold";

export default function Demo(p: Record<string, unknown>) {
  return (
    <>
      <NightFold {...p} />
      <Title>Night Fold</Title>
    </>
  );
}
