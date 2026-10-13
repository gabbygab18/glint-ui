"use client";

import { Title } from "../../demo-kit";
import { PastelCurtains } from "./pastel-curtains";

export default function Demo(p: Record<string, unknown>) {
  return (
    <>
      <PastelCurtains {...p} />
      <Title>Pastel Curtains</Title>
    </>
  );
}
