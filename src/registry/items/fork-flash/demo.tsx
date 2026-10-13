"use client";

import { Title } from "../../demo-kit";
import { ForkFlash } from "./fork-flash";

export default function Demo(p: Record<string, unknown>) {
  return (
    <>
      <ForkFlash {...p} />
      <Title>Fork Flash</Title>
    </>
  );
}
