import type { Meta } from "../../types";

export default {
  name: "Pulse Heart",
  category: "micro-interactions",
  description: "Like button whose heart squashes, pops and bursts into particles while the count rolls up digit by digit.",
  dependencies: ["motion", "lucide-react"],
  isNew: true,
  props: [
    { name: "defaultLiked", type: "boolean", default: false, description: "Initial liked state when uncontrolled." },
    { name: "count", type: "number", min: 0, max: 100000, step: 1, default: 128, description: "Likes from everyone else; your like adds one." },
    { name: "color", type: "color", default: "#f43f5e", description: "Heart and burst color." },
    { name: "particles", type: "number", min: 4, max: 20, step: 1, default: 10, description: "Particles per burst." },
    { name: "label", type: "string", default: "Like", description: "Accessible label." },
    { name: "liked", type: "node", description: "Controlled liked state, pair with onChange." },
    { name: "onChange", type: "node", description: "(liked, count) => void." },
  ],
  usage: `<PulseHeart count={post.likes} liked={post.likedByMe} onChange={(liked) => toggleLike(post.id, liked)} />`,
} satisfies Meta;
