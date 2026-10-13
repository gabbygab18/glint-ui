"use client";

import { Title } from "../../demo-kit";
import { UpdraftDust } from "./updraft-dust";

export default function Demo(p: Record<string, unknown>) {
  return (
    <>
      <UpdraftDust {...p} />
      <Title>Updraft Dust</Title>
    </>
  );
}
