"use client";

import { StaggerButton } from "./stagger-button";

export default function Demo(p: Record<string, unknown>) {
  return <StaggerButton {...p}>{typeof p.children === "string" ? p.children : "Explore the docs"}</StaggerButton>;
}
