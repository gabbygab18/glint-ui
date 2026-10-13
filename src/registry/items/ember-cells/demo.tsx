"use client";

import { Title } from "../../demo-kit";
import { EmberCells } from "./ember-cells";

export default function Demo(p: Record<string, unknown>) {
  return (
    <>
      <EmberCells {...p} />
      <Title>Ember Cells</Title>
    </>
  );
}
