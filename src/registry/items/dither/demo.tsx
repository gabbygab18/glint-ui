"use client";

import { Title } from "../../demo-kit";
import { Dither } from "./dither";

export default function Demo(p: Record<string, unknown>) {
  return (
    <>
      <Dither {...p} />
      <Title>Dither</Title>
    </>
  );
}
