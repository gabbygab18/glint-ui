"use client";

import { demoImages } from "../../demo-kit";
import { Reel } from "./reel";

const posters = demoImages(6, 540, 960);
const faces = demoImages(12, 96, 96).slice(6);
const items = [
  { author: "maya.films", caption: "Golden hour on the Tagus. Shot handheld, no grade. #lisbon #35mm", audio: "Original audio · maya.films", likes: 12400, comments: 318 },
  { author: "trailkid", caption: "4:12am alarm, worth every step. Summit at sunrise.", audio: "Low Orbit · Samuel Reyes", likes: 8930, comments: 142 },
  { author: "studio.onda", caption: "Behind the scenes of our spring lookbook shoot.", audio: "Glass Gardens · Aiko & The Tides", likes: 23100, comments: 604 },
  { author: "noodle.diaries", caption: "Hand-pulled biang biang noodles in 30 seconds flat.", audio: "Original audio · noodle.diaries", likes: 51800, comments: 1290 },
  { author: "kai.draws", caption: "Timelapse: inking a full page in one sitting.", audio: "Paper Suns · Juniper Hall", likes: 6720, comments: 88 },
  { author: "coastline.co", caption: "Swell forecast said 2ft. The ocean disagreed.", audio: "Midnight Transit · Nova Harbor", likes: 17300, comments: 402 },
].map((it, i) => ({ ...it, src: posters[i], avatar: faces[i] }));

export default function Demo(p: Record<string, unknown>) {
  return (
    <div className="relative grid place-items-center">
      <div aria-hidden className="absolute size-80 rounded-full bg-fuchsia-500/20 blur-3xl" />
      <Reel items={items} {...p} className="relative" />
    </div>
  );
}
