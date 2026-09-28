import type { Meta } from "../../types";

export default {
  name: "Button",
  category: "primitives",
  description: "shadcn-style button with six variants, a tactile press, icon slots and a loading spinner that slides the label aside.",
  isNew: true,
  dependencies: ["lucide-react"],
  props: [
    { name: "children", type: "string", default: "Deploy now", description: "Label." },
    { name: "variant", type: "select", options: ["default", "secondary", "outline", "ghost", "destructive", "link"], default: "default", description: "Visual style." },
    { name: "size", type: "select", options: ["sm", "md", "lg", "icon"], default: "md", description: "Height and padding." },
    { name: "loading", type: "boolean", default: false, description: "Spinner, aria-busy and disabled." },
    { name: "disabled", type: "boolean", default: false, description: "Disable the button." },
    { name: "startIcon", type: "node", description: "Icon before the label." },
    { name: "endIcon", type: "node", description: "Icon after the label." },
    { name: "render", type: "node", description: "Render another element, e.g. (p) => <Link href=\"/\" {...p} />." },
  ],
  usage: `<Button variant="default" startIcon={<Rocket />} loading={saving}>Deploy now</Button>

<Button variant="outline" render={(p) => <Link href="/docs" {...p} />}>Read docs</Button>`,
} satisfies Meta;
