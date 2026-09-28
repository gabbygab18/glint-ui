import type { Meta } from "../../types";

export default {
  name: "Toast",
  category: "primitives",
  description: "Toast system (provider + useToast hook) with variants, actions, in-place updates, a collapsed stack that fans out on hover, swipe to dismiss and a pausable countdown bar.",
  isNew: true,
  dependencies: ["motion", "lucide-react"],
  props: [
    { name: "placement", type: "select", options: ["top-left", "top-center", "top-right", "bottom-left", "bottom-center", "bottom-right"], default: "bottom-right", description: "Corner or edge of the stack." },
    { name: "duration", type: "number", min: 1000, max: 10000, step: 500, default: 4000, description: "Default auto-dismiss time (ms)." },
    { name: "expand", type: "boolean", default: false, description: "Always show the full list instead of a stack." },
    { name: "position", type: "select", options: ["fixed", "absolute"], default: "fixed", control: false, description: "fixed = viewport; absolute = nearest positioned parent." },
    { name: "children", type: "node", description: "Your app; call useToast() anywhere inside." },
  ],
  usage: `<ToastProvider placement="bottom-right">
  <App />
</ToastProvider>

// inside a component
const { toast, dismiss } = useToast();
toast({ title: "Saved", variant: "success" });
const id = toast({ title: "Uploading", variant: "loading" });
toast({ id, title: "Uploaded", variant: "success" }); // update in place`,
} satisfies Meta;
