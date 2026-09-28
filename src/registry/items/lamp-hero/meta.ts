import type { Meta } from "../../types";

export default {
  name: "Lamp Hero",
  category: "components",
  description: "Hero section lit by a glowing light tube whose cone swings open and the heading rises into the light when it scrolls into view.",
  isNew: true,
  props: [
    { name: "color", type: "color", default: "#5eead4", description: "Light color." },
    { name: "spread", type: "number", min: 10, max: 60, step: 1, default: 32, description: "Half-angle of the open light cone, in degrees." },
    { name: "title", type: "string", default: "Light the way to launch", description: "Heading text." },
    { name: "subtitle", type: "string", default: "Everything your team needs to ship polished interfaces, beautifully lit and ready to go.", description: "Supporting line under the heading." },
    { name: "once", type: "boolean", default: true, description: "Animate only the first time it enters the viewport." },
    { name: "children", type: "node", description: "Call-to-action buttons rendered under the subtitle." },
  ],
  usage: `<LampHero color="#5eead4" title="Light the way to launch">
  <a href="/signup">Get started</a>
</LampHero>`,
} satisfies Meta;
