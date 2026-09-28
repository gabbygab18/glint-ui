"use client";

import { demoImages } from "../../demo-kit";
import { ProfileCard } from "./profile-card";

const [portrait] = demoImages(1, 640, 900);

export default function Demo(p: Record<string, unknown>) {
  return <ProfileCard avatarUrl={portrait} {...p} />;
}
