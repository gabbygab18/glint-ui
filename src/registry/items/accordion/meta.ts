import type { Meta } from "../../types";

export default {
  name: "Accordion",
  category: "primitives",
  description: "Stacked disclosure sections with smooth auto-height animation, a springy chevron and full arrow/Home/End keyboard support.",
  isNew: true,
  dependencies: ["lucide-react"],
  props: [
    { name: "type", type: "select", options: ["single", "multiple"], default: "single", description: "Keep one item open, or allow many." },
    { name: "collapsible", type: "boolean", default: true, description: "Single mode: allow closing the open item." },
    { name: "defaultValue", type: "list", control: false, description: "Values of the items open on first render." },
    { name: "value", type: "node", description: "Controlled open values (string[])." },
    { name: "onValueChange", type: "node", description: "Called with the new open values." },
  ],
  usage: `<Accordion type="single" defaultValue={["shipping"]}>
  <AccordionItem value="shipping">
    <AccordionTrigger>How long does shipping take?</AccordionTrigger>
    <AccordionContent>Orders ship within 2 business days.</AccordionContent>
  </AccordionItem>
</Accordion>`,
} satisfies Meta;
