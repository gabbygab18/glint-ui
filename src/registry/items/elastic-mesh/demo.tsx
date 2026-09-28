"use client";

import { Title } from "../../demo-kit";
import { ElasticMesh } from "./elastic-mesh";

export default function Demo(p: Record<string, unknown>) {
  return (
    <>
      <ElasticMesh {...p} />
      <Title>Elastic Mesh</Title>
    </>
  );
}
