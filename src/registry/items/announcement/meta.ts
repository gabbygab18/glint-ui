import type { Meta } from "../../types";

export default {
  name: "Announcement",
  category: "primitives",
  description: "Pill-shaped news link with a highlighted tag, a periodic shine sweep and a chevron that extends into an arrow on hover.",
  isNew: true,
  props: [
    { name: "children", type: "string", default: "Introducing Motion primitives 2.0", description: "Announcement text." },
    { name: "tag", type: "string", default: "New", description: "Highlighted chip text (empty for none)." },
    { name: "shine", type: "boolean", default: true, description: "Periodic light sweep." },
    { name: "arrow", type: "boolean", default: true, description: "Trailing arrow that extends on hover." },
    { name: "href", type: "node", description: "Link target; all anchor attributes are forwarded." },
  ],
  usage: `<Announcement href="/blog/v2" tag="New">
  Introducing Motion primitives 2.0
</Announcement>`,
} satisfies Meta;
