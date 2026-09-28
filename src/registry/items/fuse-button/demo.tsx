"use client";

import { FuseButton } from "./fuse-button";

export default function Demo(p: Record<string, unknown>) {
  return <FuseButton {...p}>Hold to launch</FuseButton>;
}
