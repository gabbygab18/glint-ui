import type { Meta } from "../../types";

export default {
  name: "Table",
  category: "primitives",
  description: "Data table with sortable headers (flipping chevron arrows), rows that glide into their new order, hover and selection states with animated checkboxes and a sticky blurred header.",
  isNew: true,
  dependencies: ["motion"],
  props: [
    { name: "selectable", type: "boolean", default: true, description: "Checkbox column with select-all." },
    { name: "stickyHeader", type: "boolean", default: true, description: "Keep the header visible while scrolling (with maxHeight)." },
    { name: "columns", type: "node", description: "{ key, header, sortable?, align?, cell?, sortValue? }[]" },
    { name: "rows", type: "node", description: "Row objects; each needs a unique `id`." },
    { name: "maxHeight", type: "node", description: "Scroll container height (number px or CSS length)." },
    { name: "defaultSort", type: "node", description: "{ key, direction: \"asc\" | \"desc\" } or null." },
    { name: "selected", type: "node", description: "Selected row ids (controlled, with onSelectionChange)." },
  ],
  usage: `<Table
  maxHeight={320}
  rows={invoices}
  columns={[
    { key: "customer", header: "Customer", sortable: true },
    { key: "amount", header: "Amount", sortable: true, align: "right" },
  ]}
/>`,
} satisfies Meta;
