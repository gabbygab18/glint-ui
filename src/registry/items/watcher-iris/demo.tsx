"use client";

import { Title } from "../../demo-kit";
import { WatcherIris } from "./watcher-iris";

export default function Demo(p: Record<string, unknown>) {
  return (
    <>
      <WatcherIris {...p} />
      <Title>Watcher Iris</Title>
    </>
  );
}
