import type { Meta } from "../../types";

export default {
  name: "Flowing Menu",
  category: "components",
  description: "Full-width menu rows; hovering one wipes in a marquee of text and images from the edge you entered.",
  props: [
    { name: "items", type: "node", description: "Array of { label, href?, image }." },
    { name: "speed", type: "number", min: 4, max: 40, step: 1, default: 14, description: "Seconds for one marquee loop." },
    { name: "bandColor", type: "color", default: "#d9f75c", description: "Background of the revealed band." },
    { name: "bandTextColor", type: "color", default: "#0b0d06", description: "Text color inside the band." },
  ],
  usage: `<div className="h-[28rem]">
  <FlowingMenu
    items={[
      { label: "Work", href: "/work", image: "/work.jpg" },
      { label: "Studio", href: "/studio", image: "/studio.jpg" },
    ]}
  />
</div>`,
} satisfies Meta;
