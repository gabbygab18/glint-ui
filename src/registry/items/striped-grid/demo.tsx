"use client";

import { Title } from "../../demo-kit";
import { StripedGrid } from "./striped-grid";

export default function Demo(p: Record<string, unknown>) {
  return (
    <>
      <StripedGrid {...p} />
      <Title>Striped Grid</Title>
    </>
  );
}
