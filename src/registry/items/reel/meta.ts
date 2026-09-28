import type { Meta } from "../../types";

export default {
  name: "Reel",
  category: "components",
  description: "A vertical short-video reel that snaps clip to clip on scroll or drag, with story-style progress bars, slow Ken Burns motion, hold-to-pause and double-tap likes.",
  dependencies: ["motion", "lucide-react"],
  props: [
    { name: "items", type: "node", description: "Array of { src, author, avatar?, caption, audio?, likes?, comments? }." },
    { name: "duration", type: "number", min: 2000, max: 15000, step: 500, default: 6000, description: "Ms each clip plays before advancing." },
    { name: "autoPlay", type: "boolean", default: true, description: "Advance when a clip's progress bar fills." },
    { name: "loop", type: "boolean", default: true, description: "Return to the first clip after the last." },
    { name: "height", type: "number", min: 320, max: 720, step: 10, default: 440, description: "Height in px; width follows a 9:16 frame." },
  ],
  usage: `<Reel
  items={[
    { src: "/clip-1.jpg", author: "maya.films", avatar: "/maya.jpg", caption: "Golden hour in Lisbon", likes: 12400, comments: 318 },
    { src: "/clip-2.jpg", author: "trailkid", caption: "Summit at sunrise", likes: 8900, comments: 120 },
  ]}
/>`,
} satisfies Meta;
