"use client";

import { ShinyButton } from "./shiny-button";

export default function Demo(p: Record<string, unknown>) {
  return <ShinyButton {...p}>Get started</ShinyButton>;
}
