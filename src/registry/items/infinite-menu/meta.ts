import type { Meta } from "../../types";

export default {
  name: "Infinite Menu",
  category: "components",
  description: "Menu items wrapped around a sphere you drag to spin; it settles on the disc facing you and reveals its title.",
  dependencies: ["motion", "lucide-react"],
  props: [
    { name: "items", type: "node", description: "Array of { image, title, description?, href? }." },
    { name: "count", type: "number", min: 8, max: 80, step: 1, default: 42, description: "Discs on the sphere; items repeat to fill it." },
    { name: "itemSize", type: "number", min: 40, max: 160, step: 2, default: 84, description: "Disc diameter in px." },
    { name: "autoRotate", type: "boolean", default: false, description: "Slowly spin while idle instead of settling." },
  ],
  usage: `<div className="h-[32rem]">
  <InfiniteMenu items={[{ image: "/a.jpg", title: "Aurora", description: "Northern lights", href: "/aurora" }]} />
</div>`,
} satisfies Meta;
