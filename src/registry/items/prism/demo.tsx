"use client";

import { Title } from "../../demo-kit";
import { Prism } from "./prism";

export default function Demo(p: Record<string, unknown>) {
  return (
    <>
      <Prism {...p} />
      <Title>Prism</Title>
    </>
  );
}
