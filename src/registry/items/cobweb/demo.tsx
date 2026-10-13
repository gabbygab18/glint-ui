"use client";

import { Title } from "../../demo-kit";
import { Cobweb } from "./cobweb";

export default function Demo(p: Record<string, unknown>) {
  return (
    <>
      <Cobweb {...p} />
      <Title>Cobweb</Title>
    </>
  );
}
