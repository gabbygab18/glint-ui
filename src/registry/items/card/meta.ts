import type { Meta } from "../../types";

export default {
  name: "Card",
  category: "primitives",
  description: "Composable card surface (header, title, description, content, footer) with an optional hover lift and a rotating gradient border.",
  isNew: true,
  props: [
    { name: "interactive", type: "boolean", default: false, description: "Lift and deepen the shadow on hover or focus inside." },
    { name: "gradientBorder", type: "boolean", default: false, description: "Primary-tinted conic border that spins while hovered." },
    { name: "children", type: "node", description: "CardHeader, CardTitle, CardDescription, CardContent, CardFooter." },
  ],
  usage: `<Card interactive gradientBorder>
  <CardHeader>
    <CardTitle>Pro plan</CardTitle>
    <CardDescription>For growing teams.</CardDescription>
  </CardHeader>
  <CardContent>...</CardContent>
  <CardFooter>...</CardFooter>
</Card>`,
} satisfies Meta;
