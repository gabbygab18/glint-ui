import type { Meta } from "../../types";

export default {
  name: "Facescape",
  category: "components",
  description: "A little face built from simple shapes that watches your cursor, lifts its brows and grins as you get close. Click to boop.",
  props: [
    { name: "size", type: "number", min: 120, max: 480, step: 10, default: 280, description: "Face size in px." },
    { name: "faceColor", type: "color", default: "#ffd166", description: "Head color." },
    { name: "featureColor", type: "color", default: "#1c1917", description: "Eyes, brows and mouth color." },
    { name: "cheekColor", type: "color", default: "#ff8fab", description: "Blush color." },
    { name: "follow", type: "number", min: 0, max: 2, step: 0.1, default: 1, description: "How strongly the head turns toward the cursor." },
    { name: "blink", type: "boolean", default: true, description: "Blink every few seconds." },
    { name: "label", type: "string", default: "Illustrated face that follows your cursor", description: "Accessible description." },
  ],
  usage: `<div className="relative grid h-96 place-items-center">
  <Facescape size={280} faceColor="#ffd166" />
</div>`,
} satisfies Meta;
