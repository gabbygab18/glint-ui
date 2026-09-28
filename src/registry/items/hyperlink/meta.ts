import type { Meta } from "../../types";

export default {
  name: "Hyperlink",
  category: "micro-interactions",
  description: "An inline link whose underline draws in from the left and exits to the right, with a springy arrow nudge and a hover or focus preview card for the destination.",
  dependencies: ["motion", "lucide-react"],
  isNew: true,
  props: [
    { name: "href", type: "string", default: "https://nextjs.org", description: "Destination. http(s) links open in a new tab and show the arrow." },
    { name: "previewTitle", type: "string", default: "Next.js by Vercel", description: "Preview card headline. Omit title and description for no card." },
    { name: "previewDescription", type: "string", default: "The React framework for the web: routing, rendering and bundling out of the box.", description: "Preview card body." },
    { name: "color", type: "string", default: "currentColor", description: "Underline and arrow CSS color." },
    { name: "arrow", type: "node", description: "Boolean. Show the nudging arrow; defaults to true for http(s) links." },
    { name: "delay", type: "number", min: 0, max: 1000, step: 50, default: 250, description: "Ms of hover before the card opens." },
    { name: "children", type: "node", description: "Link text." },
  ],
  usage: `<Hyperlink href="https://nextjs.org" previewTitle="Next.js" previewDescription="The React framework.">
  Next.js
</Hyperlink>`,
} satisfies Meta;
