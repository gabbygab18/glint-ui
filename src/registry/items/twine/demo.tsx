"use client";

import { Title } from "../../demo-kit";
import { Twine } from "./twine";

export default function Demo(p: Record<string, unknown>) {
  return (
    <>
      <Twine {...p} />
      <Title>Twine</Title>
    </>
  );
}
