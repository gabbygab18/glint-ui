"use client";

import { Title } from "../../demo-kit";
import { WebThreads } from "./web-threads";

export default function Demo(p: Record<string, unknown>) {
  return (
    <>
      <WebThreads {...p} />
      <Title>Web Threads</Title>
    </>
  );
}
