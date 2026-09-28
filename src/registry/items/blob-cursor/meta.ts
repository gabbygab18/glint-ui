import type { Meta } from "../../types";

export default {
  name: "Blob Cursor",
  category: "animations",
  description: "A trail of gooey blobs that stretch, merge and split as they chase the pointer.",
  props: [
    { name: "children", type: "node", description: "Content under the blobs." },
    { name: "color", type: "color", default: "#c6ff3d", description: "Blob color." },
    { name: "count", type: "number", min: 1, max: 8, step: 1, default: 4, description: "Number of trailing blobs." },
    { name: "size", type: "number", min: 20, max: 240, step: 4, default: 96, description: "Diameter of the lead blob in px." },
    { name: "lag", type: "number", min: 0, max: 1.5, step: 0.05, default: 0.5, description: "0 = blobs move together, higher = longer lazy tail." },
    { name: "goo", type: "number", min: 4, max: 30, step: 1, default: 14, description: "Goo filter blur; higher melts blobs together from further away." },
    { name: "blendMode", type: "select", options: ["difference", "normal", "screen", "exclusion"], default: "difference", description: "How the blobs blend with content underneath." },
    { name: "hideCursor", type: "boolean", default: true, description: "Hide the native cursor inside the container." },
  ],
  usage: `<BlobCursor className="h-96">
  <h1>Hello</h1>
</BlobCursor>`,
} satisfies Meta;
