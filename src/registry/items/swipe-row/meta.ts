import type { Meta } from "../../types";

export default {
  name: "Swipe Row",
  category: "micro-interactions",
  description: "List row you swipe right to archive or left to delete, with rubber-band resistance, an armed pop past the threshold and a collapse on commit. Arrow keys + Enter work too.",
  dependencies: ["motion", "lucide-react"],
  isNew: true,
  props: [
    { name: "threshold", type: "number", min: 60, max: 220, step: 5, default: 110, description: "Px the row must travel to commit on release." },
    { name: "actionWidth", type: "number", min: 56, max: 140, step: 4, default: 80, description: "Width of the revealed action when the row rests half open." },
    { name: "archiveColor", type: "color", default: "#22c55e", description: "Right-swipe action color." },
    { name: "deleteColor", type: "color", default: "#ef4444", description: "Left-swipe action color." },
    { name: "archiveLabel", type: "string", default: "Archive", description: "Right-swipe action label." },
    { name: "deleteLabel", type: "string", default: "Delete", description: "Left-swipe action label." },
    { name: "label", type: "node", description: "Accessible name of the row." },
    { name: "onArchive", type: "node", description: "Called after the row swipes out and collapses. Omit to disable right swipe." },
    { name: "onDelete", type: "node", description: "Called after the row swipes out and collapses. Omit to disable left swipe." },
  ],
  usage: `{mails.map((m) => (
  <SwipeRow
    key={m.id}
    label={m.subject}
    onArchive={() => archive(m.id)}
    onDelete={() => remove(m.id)}
  >
    <MailPreview mail={m} />
  </SwipeRow>
))}`,
} satisfies Meta;
