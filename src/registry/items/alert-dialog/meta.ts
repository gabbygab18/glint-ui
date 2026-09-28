import type { Meta } from "../../types";

export default {
  name: "Alert Dialog",
  category: "primitives",
  description: "Confirmation modal on the native <dialog> with a springy scale-in, focus starting on Cancel, async confirm with spinner and destructive styling.",
  isNew: true,
  dependencies: ["lucide-react"],
  props: [
    { name: "title", type: "string", default: "Delete this project?", description: "Dialog heading." },
    { name: "description", type: "string", default: "This permanently removes Acme Web, its 214 deployments and all environment variables. This cannot be undone.", description: "Supporting text." },
    { name: "trigger", type: "string", default: "Delete project", description: "Label of the built-in trigger button. Omit to control via open." },
    { name: "confirmLabel", type: "string", default: "Continue", description: "Confirm button label." },
    { name: "cancelLabel", type: "string", default: "Cancel", description: "Cancel button label." },
    { name: "destructive", type: "boolean", default: false, description: "Red confirm button and warning icon." },
    { name: "onConfirm", type: "node", description: "Called on confirm. Return a promise to show a spinner until it settles." },
    { name: "onCancel", type: "node", description: "Called on cancel or Escape." },
    { name: "open", type: "node", description: "Controlled open state (with onOpenChange)." },
    { name: "position", type: "select", options: ["fixed", "absolute"], default: "fixed", control: false, description: "fixed = true modal; absolute = contained in the nearest positioned parent." },
  ],
  usage: `<AlertDialog
  trigger="Delete project"
  title="Delete this project?"
  description="This cannot be undone."
  confirmLabel="Delete"
  destructive
  onConfirm={() => deleteProject(id)}
/>`,
} satisfies Meta;
