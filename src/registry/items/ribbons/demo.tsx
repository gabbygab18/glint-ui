"use client";

import { Title } from "../../demo-kit";
import { Ribbons } from "./ribbons";

export default function Demo(p: Record<string, unknown>) {
  return (
    <>
      <Ribbons {...p} />
      <Title>Ribbons</Title>
    </>
  );
}
