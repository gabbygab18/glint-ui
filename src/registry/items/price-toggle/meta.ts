import type { Meta } from "../../types";

export default {
  name: "Price Toggle",
  category: "components",
  description: "A monthly / yearly pricing switch: the thumb slides between periods, the saving badge pops, and each digit of the price rolls to its new value, up when it rises and down when it drops.",
  dependencies: ["motion"],
  isNew: true,
  props: [
    { name: "monthly", type: "number", min: 1, max: 999, step: 1, default: 24, description: "Price per month, billed monthly." },
    { name: "yearly", type: "number", min: 1, max: 999, step: 1, default: 19, description: "Price per month, billed yearly." },
    { name: "currency", type: "string", default: "$", description: "Currency symbol." },
    { name: "badge", type: "node", description: "Yearly badge text; defaults to the computed saving." },
    { name: "value", type: "node", description: 'Controlled "monthly" | "yearly", pair with onChange.' },
  ],
  usage: `<PriceToggle monthly={24} yearly={19} value={billing} onChange={setBilling} />`,
} satisfies Meta;
