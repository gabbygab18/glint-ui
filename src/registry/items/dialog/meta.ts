import type { Meta } from "../../types";

export default {
  name: "Dialog",
  category: "primitives",
  description: "Modal built on the native <dialog>: blurred backdrop, spring scale-in and fade-out, Escape to close and focus returned to the trigger.",
  isNew: true,
  dependencies: ["lucide-react"],
  props: [
    { name: "defaultOpen", type: "boolean", default: false, control: false, description: "Initial open state when uncontrolled." },
    { name: "open", type: "node", description: "Controlled open state." },
    { name: "onOpenChange", type: "node", description: "Called with the next open state." },
    { name: "position", type: "select", options: ["fixed", "absolute"], default: "fixed", control: false, description: "fixed = true modal via showModal(); absolute = contained in the nearest positioned parent." },
    { name: "children", type: "node", description: "DialogTrigger and DialogContent (with DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose)." },
  ],
  usage: `<Dialog>
  <DialogTrigger>Edit profile</DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Edit profile</DialogTitle>
      <DialogDescription>Changes are visible to your team.</DialogDescription>
    </DialogHeader>
    {/* form fields */}
    <DialogFooter>
      <DialogClose>Cancel</DialogClose>
    </DialogFooter>
  </DialogContent>
</Dialog>`,
} satisfies Meta;
