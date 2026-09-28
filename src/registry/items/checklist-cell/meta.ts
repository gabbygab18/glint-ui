import type { Meta } from "../../types";

export default {
  name: "Checklist Cell",
  category: "components",
  description: "A checklist card whose ticks draw in, labels strike through, finished items glide to the bottom and a progress ring fills toward a celebratory check.",
  isNew: true,
  dependencies: ["motion", "lucide-react"],
  props: [
    { name: "title", type: "string", default: "Launch checklist", description: "Card heading." },
    { name: "allowAdd", type: "boolean", default: true, description: "Show the Add a task field." },
    { name: "sinkCompleted", type: "boolean", default: true, description: "Move completed items to the bottom." },
    { name: "defaultItems", type: "node", description: "`{ id, label, done?, tag? }[]`. Ships with six launch tasks." },
    { name: "onChange", type: "node", description: "`(items) => void`, called after every change." },
  ],
  usage: `<ChecklistCell
  title="Onboarding"
  defaultItems={[
    { id: "profile", label: "Complete your profile", done: true },
    { id: "invite", label: "Invite a teammate", tag: "2 min" },
  ]}
  onChange={(items) => save(items)}
/>`,
} satisfies Meta;
