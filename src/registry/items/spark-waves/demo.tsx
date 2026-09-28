"use client";

import { Title } from "../../demo-kit";
import { SparkWaves } from "./spark-waves";

export default function Demo(p: Record<string, unknown>) {
  return (
    <>
      <SparkWaves {...p} />
      <Title>Spark Waves</Title>
    </>
  );
}
