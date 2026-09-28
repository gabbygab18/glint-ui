"use client";

import { demoImages } from "../../demo-kit";
import { ExpandableCards } from "./expandable-cards";

const covers = demoImages(4, 640, 400);

const items = [
  {
    id: "tides",
    title: "Tides & Tidelines",
    subtitle: "Ana Ruiz · 38 min listen",
    cta: "Play",
    content:
      "A slow walk along the Atlantic coast at low tide, recorded over three mornings. Field recordings of gulls, shingle and distant engines are woven under a spoken essay about the things the sea gives back. Best with headphones and nowhere to be.",
  },
  {
    id: "concrete",
    title: "Soft Concrete",
    subtitle: "Leo Park · Photo essay",
    cta: "View",
    content:
      "Brutalist housing estates photographed in the blue hour, when the light turns grey slabs into something closer to paper. Forty images, each paired with a short note from a resident about the building they call home.",
  },
  {
    id: "orchard",
    title: "The Night Orchard",
    subtitle: "Maya Chen · Short fiction",
    cta: "Read",
    content:
      "An orchard that only fruits after dark, and the family who has tended it for four generations without ever seeing a single blossom open. A quiet, strange story about inheritance and patience, in about twenty minutes of reading.",
  },
  {
    id: "signal",
    title: "Signal / Noise",
    subtitle: "Priya Nair · Live set",
    cta: "Play",
    content:
      "Ninety minutes of modular synth recorded live in a disused water tower, the reverb doing half the work. Starts minimal and builds into dense, warm drones before dissolving back into static near the end.",
  },
].map((item, i) => ({ ...item, image: covers[i] }));

export default function Demo(p: Record<string, unknown>) {
  return (
    <div className="w-full max-w-xl px-4">
      <ExpandableCards items={items} {...p} className="min-h-[24rem]" />
    </div>
  );
}
