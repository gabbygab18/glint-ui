"use client";

import { Title } from "../../demo-kit";
import { SatinFolds } from "./satin-folds";

export default function Demo(p: Record<string, unknown>) {
  return (
    <>
      <SatinFolds {...p} />
      <Title>Satin Folds</Title>
    </>
  );
}
