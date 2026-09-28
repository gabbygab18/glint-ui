"use client";

import { Title } from "../../demo-kit";
import { Aurora } from "./aurora";

export default function Demo(p: Record<string, unknown>) {
  return (
    <>
      <Aurora {...p} />
      <Title>Aurora</Title>
    </>
  );
}
