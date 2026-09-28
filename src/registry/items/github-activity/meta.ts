import type { Meta } from "../../types";

export default {
  name: "GitHub Activity",
  category: "widgets",
  description: "A contribution calendar on a squircle card whose busiest repos stack as avatars and expand into a drawer over the grid.",
  isNew: true,
  dependencies: ["motion", "figma-squircle", "react-use-measure"],
  credit: { label: "Calamansi UI", url: "https://github.com/fujiDevv/calamansi-ui", license: "MIT" },
  props: [
    { name: "variant", type: "select", options: ["calamansi", "white", "slate", "citrus"], default: "calamansi", description: "Surface palette, with its own contribution ramp." },
    { name: "cellSize", type: "number", min: 6, max: 18, step: 1, default: 11, description: "Size of one day, in px." },
    { name: "months", type: "number", min: 1, max: 12, step: 1, default: 12, description: "Months of history to show when there is room; the grid trims to fit." },
    { name: "showMonths", type: "boolean", default: false, description: "Show month labels above the grid." },
    { name: "label", type: "string", default: "Top contributions in:", description: "Label on the repository drawer." },
    { name: "defaultOpen", type: "boolean", default: false, description: "Open the repository drawer on mount." },
    { name: "accent", type: "color", control: false, description: "One colour (faded by opacity) or a 4-step array for levels 1-4. Defaults to the variant ramp." },
    { name: "username", type: "string", control: false, description: "GitHub login. When set, the calendar and recent pushes are fetched in the browser." },
    { name: "contributions", type: "node", description: "`{ date, count, level }[]` starting on a Sunday. Pass it to skip the network." },
    { name: "repos", type: "node", description: "`{ name, count, logo?, href? }[]` for the drawer." },
    { name: "year", type: "number", min: 2008, max: 2100, control: false, description: "Year in the heading. Defaults to the year the data ends on." },
    { name: "open", type: "boolean", control: false, description: "Controlled drawer state." },
    { name: "onOpenChange", type: "node", description: "`(open) => void`, fired when the drawer toggles." },
  ],
  usage: `<GitHubActivity username="fujiDevv" />

// or drive it from your own data
<GitHubActivity contributions={days} repos={repos} />`,
} satisfies Meta;
