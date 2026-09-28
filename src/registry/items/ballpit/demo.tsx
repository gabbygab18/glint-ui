"use client";

import { Title } from "../../demo-kit";
import { Ballpit } from "./ballpit";

export default function Demo(p: Record<string, unknown>) {
  return (
    <>
      <Ballpit {...p} />
      <Title>Ballpit</Title>
    </>
  );
}
