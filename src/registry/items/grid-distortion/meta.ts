import type { Meta } from "../../types";

export default {
  name: "Grid Distortion",
  category: "backgrounds",
  description: "An image on a grid of tiles that smear along with the cursor and ease back into place.",
  props: [
    { name: "imageSrc", type: "string", default: "https://picsum.photos/seed/glint-1/1600/1000", description: "Image URL (must allow CORS)." },
    { name: "grid", type: "number", min: 4, max: 60, step: 1, default: 15, description: "Grid cells per side." },
    { name: "mouseRadius", type: "number", min: 0.05, max: 0.6, step: 0.01, default: 0.18, description: "Cursor influence radius (fraction of height)." },
    { name: "strength", type: "number", min: 0, max: 4, step: 0.1, default: 1, description: "How far cells get dragged." },
    { name: "relaxation", type: "number", min: 0.5, max: 0.99, step: 0.01, default: 0.92, description: "Easing back to rest; higher is slower." },
  ],
  usage: `<div className="relative h-96">
  <GridDistortion imageSrc="/photo.jpg" grid={15} />
</div>`,
} satisfies Meta;
