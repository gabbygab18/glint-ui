"use client";

import { demoImages } from "../../demo-kit";
import { MediaCard } from "./media-card";

const covers = demoImages(4, 600, 600);
const tracks = [
  { title: "Midnight Transit", artist: "Nova Harbor", duration: 214 },
  { title: "Glass Gardens", artist: "Aiko & The Tides", duration: 187 },
  { title: "Low Orbit", artist: "Samuel Reyes", duration: 243 },
  { title: "Paper Suns", artist: "Juniper Hall", duration: 198 },
].map((t, i) => ({ ...t, cover: covers[i] }));

export default function Demo(p: Record<string, unknown>) {
  return <MediaCard tracks={tracks} {...p} className="scale-[.82] sm:scale-90" />;
}
