import type { Meta } from "../../types";

export default {
  name: "Pagination",
  category: "primitives",
  description: "Page controls with fixed-width ellipsis logic, a spring-sliding active pill, and ellipses that turn into skip buttons on hover.",
  isNew: true,
  dependencies: ["motion", "lucide-react"],
  props: [
    { name: "total", type: "number", min: 1, max: 50, step: 1, default: 20, description: "Number of pages." },
    { name: "siblings", type: "number", min: 0, max: 3, step: 1, default: 1, description: "Pages shown on each side of the current page." },
    { name: "boundaries", type: "number", min: 0, max: 3, step: 1, default: 1, description: "Pages always shown at each end." },
    { name: "showControls", type: "boolean", default: true, description: "Previous / Next buttons." },
    { name: "page", type: "node", description: "Controlled 1-based page (with onPageChange), or use defaultPage." },
    { name: "onPageChange", type: "node", description: "Called with the new page." },
  ],
  usage: `<Pagination total={20} page={page} onPageChange={setPage} />`,
} satisfies Meta;
