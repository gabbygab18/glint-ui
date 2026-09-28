import type { Meta } from "../../types";

export default {
  name: "Sheet",
  category: "primitives",
  description: "Side panel on the native <dialog> that slides in from any edge with a springy ease, staggers its content in, blurs the backdrop and returns focus on close.",
  isNew: true,
  dependencies: ["lucide-react"],
  props: [
    { name: "side", type: "select", options: ["right", "left", "top", "bottom"], default: "right", description: "Edge the sheet slides in from (SheetContent prop)." },
    { name: "defaultOpen", type: "boolean", default: false, control: false, description: "Initial open state when uncontrolled." },
    { name: "open", type: "node", description: "Controlled open state (with onOpenChange)." },
    { name: "position", type: "select", options: ["fixed", "absolute"], default: "fixed", control: false, description: "fixed = true modal via showModal(); absolute = contained in the nearest positioned parent." },
    { name: "children", type: "node", description: "SheetTrigger and SheetContent (with SheetHeader, SheetTitle, SheetDescription, SheetFooter, SheetClose)." },
  ],
  usage: `<Sheet>
  <SheetTrigger>Open</SheetTrigger>
  <SheetContent side="right">
    <SheetHeader>
      <SheetTitle>Edit profile</SheetTitle>
      <SheetDescription>Save when you are done.</SheetDescription>
    </SheetHeader>
    {/* fields */}
    <SheetFooter>
      <SheetClose>Cancel</SheetClose>
    </SheetFooter>
  </SheetContent>
</Sheet>`,
} satisfies Meta;
