import type { Meta } from "../../types";

export default {
  name: "Progress",
  category: "primitives",
  description: "Linear and circular progress with a spring-animated value and counting label, a moving sheen, and indeterminate slide and spin states.",
  isNew: true,
  dependencies: ["motion"],
  props: [
    { name: "value", type: "number", min: 0, max: 100, step: 1, default: 64, description: "Current value (0 to max). Pass null for indeterminate." },
    { name: "indeterminate", type: "boolean", default: false, description: "Demo control: sends value={null}." },
    { name: "variant", type: "select", options: ["linear", "circular"], default: "linear", description: "Bar or ring." },
    { name: "size", type: "select", options: ["sm", "md", "lg"], default: "md", description: "Thickness or diameter." },
    { name: "label", type: "string", default: "Building your workspace", description: "Visible label and accessible name." },
    { name: "showValue", type: "boolean", default: true, description: "Show the animated percentage." },
    { name: "max", type: "number", min: 1, max: 1000, step: 1, default: 100, description: "Value at 100%." },
  ],
  usage: `<Progress label="Uploading" value={progress} />
<Progress variant="circular" value={null} label="Indexing" />`,
} satisfies Meta;
