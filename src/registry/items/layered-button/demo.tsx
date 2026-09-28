"use client";

import { LayeredButton } from "./layered-button";

export default function Demo(p: Record<string, unknown>) {
  return <LayeredButton {...p}>Press me</LayeredButton>;
}
