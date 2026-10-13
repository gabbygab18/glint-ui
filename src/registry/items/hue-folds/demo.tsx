"use client";

import { Title } from "../../demo-kit";
import { HueFolds } from "./hue-folds";

export default function Demo(p: Record<string, unknown>) {
  return (
    <>
      <HueFolds {...p} />
      <Title>Hue Folds</Title>
    </>
  );
}
