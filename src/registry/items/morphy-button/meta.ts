import type { Meta } from "../../types";

export default {
  name: "Morphy Button",
  category: "buttons",
  description: "A pill that morphs into a spinning circle while loading, then pops a drawn check on success.",
  dependencies: ["motion"],
  isNew: true,
  props: [
    { name: "children", type: "node", description: "Button label." },
    { name: "status", type: "select", options: ["idle", "loading", "success"], default: "idle", description: "Visual state. The demo cycles it on click." },
    { name: "successColor", type: "color", default: "#22c55e", description: "Fill color in the success state." },
  ],
  usage: `const [status, setStatus] = useState<MorphyStatus>("idle");

<MorphyButton
  status={status}
  onClick={async () => {
    setStatus("loading");
    await save();
    setStatus("success");
  }}
>
  Save changes
</MorphyButton>`,
} satisfies Meta;
