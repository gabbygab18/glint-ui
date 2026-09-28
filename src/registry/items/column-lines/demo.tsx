"use client";

import { Title } from "../../demo-kit";
import { ColumnLines } from "./column-lines";

export default function Demo(p: Record<string, unknown>) {
  return (
    <>
      <ColumnLines {...p} />
      <Title>Column Lines</Title>
    </>
  );
}
