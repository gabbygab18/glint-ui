import type { Meta } from "../../types";

export default {
  name: "Media Card",
  category: "components",
  description: "Music player card with cover art, a scrubbable progress bar, a morphing play/pause icon and a live equalizer.",
  dependencies: ["motion", "lucide-react"],
  props: [
    { name: "tracks", type: "node", description: "Array of { title, artist, cover, duration } (duration in seconds)." },
    { name: "accent", type: "color", default: "#a3e635", description: "Progress, play button and equalizer color." },
    { name: "autoPlay", type: "boolean", default: false, description: "Start playing on mount." },
    { name: "bars", type: "number", min: 2, max: 8, step: 1, default: 4, description: "Number of equalizer bars." },
    { name: "glow", type: "boolean", default: true, description: "Blurred cover glow behind the card." },
  ],
  usage: `<MediaCard
  tracks={[{ title: "Midnight Transit", artist: "Nova Harbor", cover: "/cover.jpg", duration: 214 }]}
  accent="#a3e635"
/>`,
} satisfies Meta;
