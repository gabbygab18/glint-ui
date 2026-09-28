import type { Meta } from "../../types";

export default {
  name: "Logo Stepper",
  category: "components",
  description: "A row of logos that steps through one at a time, with a spring focus ring sliding between them and a caption per logo.",
  dependencies: ["motion"],
  props: [
    { name: "logos", type: "node", description: "Array of { name, logo, caption? }." },
    { name: "interval", type: "number", min: 800, max: 8000, step: 100, default: 2400, description: "Ms each logo stays highlighted." },
    { name: "autoPlay", type: "boolean", default: true, description: "Step automatically; pauses on hover and focus." },
    { name: "accent", type: "color", default: "#a3e635", description: "Focus ring and progress color." },
    { name: "dimInactive", type: "boolean", default: true, description: "Dim and desaturate the other logos." },
  ],
  usage: `<LogoStepper
  logos={[
    { name: "Northwind", logo: <NorthwindLogo />, caption: "68% faster builds." },
    { name: "Lumen", logo: <LumenLogo />, caption: "3.1M monthly visitors." },
  ]}
/>`,
} satisfies Meta;
