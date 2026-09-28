import type { Meta } from "../../types";

export default {
  name: "Peek Rating",
  category: "micro-interactions",
  description: "Star rating with a little character that peeks over the card, rising and grinning wider the higher you hover. Arrow keys, Home/End and digits work too.",
  dependencies: ["motion"],
  isNew: true,
  props: [
    { name: "defaultValue", type: "number", min: 0, max: 5, step: 1, default: 0, description: "Initial rating when uncontrolled." },
    { name: "max", type: "number", min: 3, max: 10, step: 1, default: 5, description: "Number of stars." },
    { name: "color", type: "color", default: "#facc15", description: "Star fill color." },
    { name: "characterColor", type: "color", default: "#fb923c", description: "Color of the peeking character." },
    { name: "label", type: "string", default: "Rating", description: "Accessible name of the rating." },
    { name: "labels", type: "list", default: ["Awful", "Meh", "Okay", "Good", "Love it!"], description: "One word per rating step." },
    { name: "value", type: "node", description: "Controlled rating, pair with onChange." },
    { name: "onChange", type: "node", description: "Called with the new rating." },
  ],
  usage: `const [stars, setStars] = useState(0);

<PeekRating value={stars} onChange={setStars} />`,
} satisfies Meta;
