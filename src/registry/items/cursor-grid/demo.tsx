"use client";

import { Title } from "../../demo-kit";
import { CursorGrid } from "./cursor-grid";

export default function Demo(p: Record<string, unknown>) {
  return (
    <>
      <CursorGrid {...p} />
      <Title>Cursor Grid</Title>
    </>
  );
}
