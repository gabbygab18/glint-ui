import type { Meta } from "../../types";

export default {
  name: "Collapsible",
  category: "primitives",
  description: "Show-more region whose height, opacity and blur ease open smoothly, controlled or uncontrolled.",
  isNew: true,
  props: [
    { name: "defaultOpen", type: "boolean", default: false, description: "Initial open state when uncontrolled." },
    { name: "disabled", type: "boolean", default: false, description: "Disable the trigger." },
    { name: "open", type: "node", description: "Controlled open state (with onOpenChange)." },
    { name: "onOpenChange", type: "node", description: "Called with the next open state." },
  ],
  usage: `<Collapsible>
  <CollapsibleTrigger>Show all items</CollapsibleTrigger>
  <CollapsibleContent>...</CollapsibleContent>
</Collapsible>`,
} satisfies Meta;
