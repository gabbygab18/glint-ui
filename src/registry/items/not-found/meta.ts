import type { Meta } from "../../types";

export default {
  name: "Not Found",
  category: "components",
  description: "Drop-in 404 section: a huge parallax code with RGB-split glitch bursts, a friendly message and a home button.",
  dependencies: ["lucide-react"],
  props: [
    { name: "code", type: "string", default: "404", description: "Big code shown in the middle." },
    { name: "title", type: "string", default: "This page drifted off", description: "Heading." },
    { name: "message", type: "string", default: "The link might be broken, or the page moved somewhere new. Let's get you back on track.", description: "Supporting text." },
    { name: "homeHref", type: "string", default: "/", description: "Where the button goes." },
    { name: "buttonLabel", type: "string", default: "Back to home", description: "Button text." },
    { name: "glitch", type: "boolean", default: true, description: "Periodic RGB-split glitch bursts." },
    { name: "parallax", type: "number", min: 0, max: 60, step: 1, default: 18, description: "Px each digit drifts with the pointer." },
    { name: "accent", type: "color", default: "#f43f5e", description: "Glow and glitch accent." },
  ],
  usage: `// app/not-found.tsx
export default function NotFoundPage() {
  return (
    <main className="h-screen">
      <NotFound homeHref="/" />
    </main>
  );
}`,
} satisfies Meta;
