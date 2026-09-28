import type { Meta } from "../../types";

export default {
  name: "Dropdown Menu",
  category: "primitives",
  description: "Menu button on the native Popover API with a highlight that glides between items, shortcuts, checkbox and radio items, submenus, typeahead and full keyboard support.",
  isNew: true,
  dependencies: ["motion", "lucide-react"],
  props: [
    { name: "side", type: "select", options: ["bottom", "top", "right", "left"], default: "bottom", description: "Content: preferred side (flips when there is no room)." },
    { name: "align", type: "select", options: ["start", "center", "end"], default: "start", description: "Content: alignment along the trigger." },
    { name: "sideOffset", type: "number", min: 0, max: 24, step: 1, default: 6, description: "Content: gap to the trigger in px." },
    { name: "open", type: "node", description: "DropdownMenu: controlled open state (with onOpenChange), or defaultOpen." },
    {
      name: "children",
      type: "node",
      description:
        "DropdownMenuItem (onSelect, icon, shortcut, variant, disabled), DropdownMenuCheckboxItem, DropdownMenuRadioGroup + DropdownMenuRadioItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuSub + SubTrigger + SubContent.",
    },
  ],
  usage: `<DropdownMenu>
  <DropdownMenuTrigger>Options</DropdownMenuTrigger>
  <DropdownMenuContent>
    <DropdownMenuItem icon={<User />} shortcut="⇧⌘P">Profile</DropdownMenuItem>
    <DropdownMenuCheckboxItem checked={bar} onCheckedChange={setBar}>Status bar</DropdownMenuCheckboxItem>
    <DropdownMenuSeparator />
    <DropdownMenuSub>
      <DropdownMenuSubTrigger>Invite</DropdownMenuSubTrigger>
      <DropdownMenuSubContent>
        <DropdownMenuItem>Email</DropdownMenuItem>
      </DropdownMenuSubContent>
    </DropdownMenuSub>
  </DropdownMenuContent>
</DropdownMenu>`,
} satisfies Meta;
