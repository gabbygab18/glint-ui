import type { Meta } from "../../types";

export default {
  name: "Drawer",
  category: "primitives",
  description: "Bottom sheet on the native <dialog> that springs up, drags with a rubber-band feel, snaps to heights, and flicks down to dismiss while the backdrop fades with it.",
  isNew: true,
  dependencies: ["motion"],
  props: [
    { name: "snapPoints", type: "string", default: "0.55, 1", description: "Resting heights as fractions of the sheet, number[] in code. Component default [1]; this demo uses [0.55, 1]." },
    { name: "dismissible", type: "boolean", default: true, description: "Close by dragging down, the backdrop or Escape." },
    { name: "defaultSnap", type: "node", description: "Index into snapPoints to open at (default: the tallest)." },
    { name: "defaultOpen", type: "boolean", default: false, control: false, description: "Initial open state when uncontrolled." },
    { name: "open", type: "node", description: "Controlled open state (with onOpenChange)." },
    { name: "position", type: "select", options: ["fixed", "absolute"], default: "fixed", control: false, description: "fixed = true modal via showModal(); absolute = contained in the nearest positioned parent." },
    { name: "children", type: "node", description: "DrawerTrigger and DrawerContent (with DrawerHeader, DrawerTitle, DrawerDescription, DrawerFooter, DrawerClose)." },
  ],
  usage: `<Drawer snapPoints={[0.5, 1]}>
  <DrawerTrigger>Filters</DrawerTrigger>
  <DrawerContent>
    <DrawerHeader>
      <DrawerTitle>Filters</DrawerTitle>
      <DrawerDescription>Refine your results.</DrawerDescription>
    </DrawerHeader>
    {/* ... */}
    <DrawerFooter>
      <DrawerClose>Done</DrawerClose>
    </DrawerFooter>
  </DrawerContent>
</Drawer>`,
} satisfies Meta;
