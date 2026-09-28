import type { Meta } from "../../types";

export default {
  name: "Tabs",
  category: "primitives",
  description: "Accessible tabs with a spring-animated pill or underline indicator, roving arrow-key focus, direction-aware panel transitions and lazily mounted panels that keep their state.",
  isNew: true,
  dependencies: ["motion"],
  props: [
    { name: "variant", type: "select", options: ["pill", "underline"], default: "pill", description: "Indicator style." },
    { name: "orientation", type: "select", options: ["horizontal", "vertical"], default: "horizontal", description: "Tab list direction and arrow keys." },
    { name: "activationMode", type: "select", options: ["automatic", "manual"], default: "automatic", description: "Select on arrow focus, or on Enter/Space." },
    { name: "defaultValue", type: "string", control: false, description: "Initially selected tab (uncontrolled)." },
    { name: "value", type: "node", description: "Selected tab (controlled, with onValueChange)." },
    { name: "children", type: "node", description: "TabsList with TabsTrigger items, then TabsContent panels." },
  ],
  usage: `<Tabs defaultValue="account">
  <TabsList>
    <TabsTrigger value="account">Account</TabsTrigger>
    <TabsTrigger value="password">Password</TabsTrigger>
  </TabsList>
  <TabsContent value="account">...</TabsContent>
  <TabsContent value="password">...</TabsContent>
</Tabs>`,
} satisfies Meta;
