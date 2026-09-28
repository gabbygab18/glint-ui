"use client";

import { Title } from "../../demo-kit";
import { Threads } from "./threads";

export default function Demo(p: Record<string, unknown>) {
  return (
    <>
      <Threads {...p} />
      <Title>Threads</Title>
    </>
  );
}
