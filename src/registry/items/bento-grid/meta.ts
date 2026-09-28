import type { Meta } from "../../types";

export default {
  name: "Bento Grid",
  category: "components",
  description: "Responsive bento layout of feature tiles with hover lifts, playful icons and a cursor spotlight that glows across tile borders.",
  dependencies: ["lucide-react"],
  props: [
    { name: "children", type: "node", description: "BentoCard elements ({ title, description, icon, visual?, href?, cta?, className })." },
    { name: "columns", type: "number", min: 1, max: 6, step: 1, default: 3, description: "Columns on wide screens." },
    { name: "rowHeight", type: "number", min: 120, max: 320, step: 4, default: 176, description: "Row height in px." },
    { name: "gap", type: "number", min: 0, max: 32, step: 1, default: 12, description: "Gap between tiles in px." },
    { name: "spotlight", type: "boolean", default: true, description: "Cursor glow across tile borders." },
    { name: "spotlightColor", type: "color", default: "#a3e635", description: "Spotlight color." },
  ],
  usage: `<BentoGrid>
  <BentoCard className="md:col-span-2" icon={<Search />} title="Instant search" description="Find anything fast." visual={<Preview />} href="/search" />
  <BentoCard icon={<ChartColumn />} title="Analytics" description="Live metrics." />
</BentoGrid>`,
} satisfies Meta;
