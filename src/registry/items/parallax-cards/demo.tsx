"use client";

import { demoImages } from "../../demo-kit";
import { ParallaxCards } from "./parallax-cards";

const photos = demoImages(9, 800, 1000);
const items = [
  { title: "Kyoto", subtitle: "Temples at first light", tag: "Culture" },
  { title: "Lofoten", subtitle: "Fishing villages, Norway", tag: "Nature" },
  { title: "Marrakech", subtitle: "Souks and riads", tag: "Markets" },
  { title: "Patagonia", subtitle: "Torres del Paine trek", tag: "Hiking" },
  { title: "Amalfi", subtitle: "Cliffside lemon groves", tag: "Coast" },
  { title: "Reykjavík", subtitle: "Chasing the aurora", tag: "Winter" },
  { title: "Oaxaca", subtitle: "Mezcal and murals", tag: "Food" },
  { title: "Queenstown", subtitle: "Lakes and alpine air", tag: "Adventure" },
  { title: "Lisbon", subtitle: "Trams up the hills", tag: "City" },
].map((it, i) => ({ ...it, image: photos[i] }));

export default function Demo(p: Record<string, unknown>) {
  return <ParallaxCards items={items} {...p} />;
}
