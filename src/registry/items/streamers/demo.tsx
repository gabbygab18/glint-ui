"use client";

import { Title } from "../../demo-kit";
import { Streamers } from "./streamers";

export default function Demo(p: Record<string, unknown>) {
  return (
    <>
      <Streamers {...p} />
      <Title>Streamers</Title>
    </>
  );
}
