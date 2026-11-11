import type { Meta } from "../../types";

export default {
  name: "Skeleton Swap",
  category: "micro-interactions",
  description: "A shimmering placeholder that dissolves into the real content when loading ends: the skeleton blurs out, the content sharpens in and the box eases to its new height.",
  dependencies: ["motion", "react-use-measure"],
  isNew: true,
  props: [
    { name: "lines", type: "number", min: 1, max: 6, step: 1, default: 3, description: "Text lines in the default placeholder." },
    { name: "avatar", type: "boolean", default: true, description: "Show a round avatar in the default placeholder." },
    { name: "shimmer", type: "boolean", default: true, description: "Sweep a highlight across the placeholder." },
    { name: "duration", type: "number", min: 0.1, max: 1.5, step: 0.05, default: 0.45, description: "Cross-fade length in seconds." },
    { name: "loading", type: "node", description: "Show the skeleton while true." },
    { name: "skeleton", type: "node", description: "Custom placeholder node." },
  ],
  usage: `<SkeletonSwap loading={isLoading}>
  <ProfileRow user={user} />
</SkeletonSwap>`,
} satisfies Meta;
