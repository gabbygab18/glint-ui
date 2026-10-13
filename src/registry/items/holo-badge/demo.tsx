"use client";

import { demoImages } from "../../demo-kit";
import { HoloBadge } from "./holo-badge";

const [portrait] = demoImages(1, 640, 900);

export default function Demo(p: Record<string, unknown>) {
  return <HoloBadge avatarUrl={portrait} {...p} />;
}
