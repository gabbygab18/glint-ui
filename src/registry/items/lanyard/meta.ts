import type { Meta } from "../../types";

export default {
  name: "Lanyard",
  category: "components",
  description: "An ID badge hanging from a woven strap with verlet rope physics. Grab it, fling it and watch it swing back.",
  props: [
    { name: "name", type: "string", default: "Ada Park", description: "Name printed on the badge." },
    { name: "role", type: "string", default: "Design Engineer", description: "Role printed under the name." },
    { name: "image", type: "string", description: "Photo URL for the badge." },
    { name: "strapColor", type: "color", default: "#c6f24e", description: "Strap and header color." },
    { name: "ropeLength", type: "number", min: 60, max: 400, step: 10, default: 170, description: "Strap length in px." },
    { name: "badgeWidth", type: "number", min: 120, max: 280, step: 10, default: 180, description: "Badge width in px." },
    { name: "gravity", type: "number", min: 0.2, max: 3, step: 0.1, default: 1, description: "Gravity multiplier." },
    { name: "children", type: "node", description: "Replace the default badge face." },
  ],
  usage: `<div className="relative h-[32rem]">
  <Lanyard name="Ada Park" role="Design Engineer" image="/me.jpg" />
</div>`,
} satisfies Meta;
