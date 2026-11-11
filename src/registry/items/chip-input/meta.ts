import type { Meta } from "../../types";

export default {
  name: "Chip Input",
  category: "components",
  description: "A tag field where Enter or a comma pops text into a chip, the others slide aside when one leaves, a duplicate shakes the existing chip, and Backspace marks then removes the last one.",
  dependencies: ["motion", "lucide-react"],
  isNew: true,
  props: [
    { name: "label", type: "string", default: "Tags", description: "Field label." },
    { name: "placeholder", type: "string", default: "Add a tag…", description: "Placeholder text." },
    { name: "max", type: "number", min: 1, max: 20, step: 1, default: 12, description: "Maximum number of chips." },
    { name: "value", type: "node", description: "Controlled chips (string[]), pair with onChange." },
  ],
  usage: `<ChipInput value={tags} onChange={setTags} max={8} />`,
} satisfies Meta;
